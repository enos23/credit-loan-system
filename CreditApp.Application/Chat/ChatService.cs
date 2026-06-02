using System.Diagnostics;
using System.Text.Json;
using CreditApp.Application.Chat.Dtos;
using CreditApp.Application.Chat.Models;
using CreditApp.Application.Chat.Tools;
using CreditApp.Application.Configuration;
using CreditApp.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CreditApp.Application.Chat;

public class ChatService : IChatService
{
    // Hard cap on tool-use rounds. The model can't loop forever even if it "wants to" —
    // we force a stop and let it produce a final answer with whatever it has.
    private const int MaxToolUseIterations = 5;

    private readonly IAnthropicClient _anthropicClient;
    private readonly IEnumerable<IChatTool> _tools;
    private readonly AnthropicSettings _settings;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        IAnthropicClient anthropicClient,
        IEnumerable<IChatTool> tools,
        IOptions<AnthropicSettings> settings,
        ILogger<ChatService> logger)
    {
        _anthropicClient = anthropicClient;
        _tools = tools;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<ChatMessageResponse> SendMessageAsync(
        ChatMessageRequest request,
        Guid userId,
        UserRole userRole,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();

        // Filter tools the current user is allowed to call. Bankers don't see
        // get_decision or list_transactions (per CHATBOT.md §4).
        var allowedTools = _tools.Where(t => t.AllowedRoles.Contains(userRole)).ToList();
        var toolDefinitions = BuildToolDefinitions(allowedTools);
        var toolsByName = allowedTools.ToDictionary(t => t.Name);

        var messages = new List<ChatMessage>(request.History) { ChatMessage.UserText(request.Message) };
        var response = new ChatMessageResponse();

        for (int iteration = 0; iteration < MaxToolUseIterations; iteration++)
        {
            response.Usage.Iterations = iteration + 1;

            var chatRequest = new ChatRequest
            {
                Model = _settings.Model,
                MaxTokens = _settings.MaxTokensPerResponse,
                System = BuildSystemBlocks(),
                Tools = toolDefinitions,
                Messages = messages,
            };

            var apiResponse = await _anthropicClient.SendAsync(chatRequest, cancellationToken);
            AccumulateUsage(response.Usage, apiResponse.Usage);

            // Append the assistant turn to history so the model sees its own prior moves
            // (it needs this when a tool_result references a previous tool_use id).
            messages.Add(new ChatMessage { Role = "assistant", Content = apiResponse.Content });

            // If the model is asking for tools, run them; otherwise, we're done.
            var toolUseBlocks = apiResponse.Content.Where(b => b.Type == "tool_use").ToList();
            if (toolUseBlocks.Count == 0)
                break;

            // Execute sequentially. Some tools touch the shared DbContext through services,
            // so parallel execution would risk EF concurrency exceptions.
            var toolResults = new List<ChatContentBlock>();
            foreach (var block in toolUseBlocks)
            {
                var trace = await ExecuteToolAsync(block, toolsByName, cancellationToken);
                response.ToolCalls.Add(trace);
                response.Usage.ToolCallCount++;

                toolResults.Add(ChatContentBlock.ToolResultBlock(
                    toolUseId: block.Id ?? string.Empty,
                    content: trace.Result,
                    isError: trace.IsError));
            }

            messages.Add(new ChatMessage { Role = "user", Content = toolResults });
        }

        // Final reply: concatenate text blocks from the last assistant turn.
        // If we hit the iteration cap mid-tool-use, the final assistant turn
        // may still contain useful text alongside an abandoned tool_use.
        var finalAssistant = messages.LastOrDefault(m => m.Role == "assistant");
        if (finalAssistant != null)
        {
            response.Reply = string.Join("\n",
                finalAssistant.Content
                    .Where(b => b.Type == "text" && !string.IsNullOrEmpty(b.Text))
                    .Select(b => b.Text));
        }

        if (string.IsNullOrWhiteSpace(response.Reply))
            response.Reply = "Nu am putut formula un răspuns. Încearcă să reformulezi întrebarea.";

        stopwatch.Stop();
        _logger.LogInformation(
            "Chat request completed for user {UserId}: {Iterations} iterations, {ToolCalls} tool calls, " +
            "{InputTokens} input / {OutputTokens} output tokens, {DurationMs}ms",
            userId, response.Usage.Iterations, response.Usage.ToolCallCount,
            response.Usage.InputTokens, response.Usage.OutputTokens, stopwatch.ElapsedMilliseconds);

        return response;
    }

    private List<ChatContentBlock> BuildSystemBlocks() => new()
    {
        new ChatContentBlock
        {
            Type = "text",
            Text = SystemPrompt.Text,
            // Cache the system prompt so subsequent turns in the same 5-min window
            // pay only the (cheap) cache-read price instead of re-tokenizing.
            CacheControl = new CacheControl(),
        }
    };

    private static List<ChatTool> BuildToolDefinitions(IReadOnlyList<IChatTool> tools)
    {
        var list = new List<ChatTool>(tools.Count);
        for (int i = 0; i < tools.Count; i++)
        {
            list.Add(new ChatTool
            {
                Name = tools[i].Name,
                Description = tools[i].Description,
                InputSchema = tools[i].InputSchema,
                // Cache breakpoint on the last tool — caches the whole tool block.
                CacheControl = i == tools.Count - 1 ? new CacheControl() : null,
            });
        }
        return list;
    }

    private async Task<ToolCallTrace> ExecuteToolAsync(
        ChatContentBlock toolUse,
        IReadOnlyDictionary<string, IChatTool> toolsByName,
        CancellationToken cancellationToken)
    {
        var name = toolUse.Name ?? "<unknown>";
        var argsJson = toolUse.Input?.GetRawText() ?? "{}";

        if (!toolsByName.TryGetValue(name, out var tool))
        {
            _logger.LogWarning("Model requested unknown tool '{ToolName}'", name);
            return new ToolCallTrace
            {
                Name = name,
                Arguments = argsJson,
                Result = JsonSerializer.Serialize(new { error = $"Tool '{name}' is not available." }),
                IsError = true,
            };
        }

        try
        {
            var result = await tool.ExecuteAsync(toolUse.Input ?? default, cancellationToken);
            return new ToolCallTrace
            {
                Name = name,
                Arguments = argsJson,
                Result = result,
                IsError = false,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Tool '{ToolName}' threw", name);
            return new ToolCallTrace
            {
                Name = name,
                Arguments = argsJson,
                Result = JsonSerializer.Serialize(new { error = ex.Message }),
                IsError = true,
            };
        }
    }

    private static void AccumulateUsage(ChatUsageSummary acc, ChatUsage delta)
    {
        acc.InputTokens += delta.InputTokens;
        acc.OutputTokens += delta.OutputTokens;
        acc.CacheReadTokens += delta.CacheReadInputTokens ?? 0;
        acc.CacheWriteTokens += delta.CacheCreationInputTokens ?? 0;
    }
}
