using System.Net.Http.Json;
using System.Text.Json;
using CreditApp.Application.Chat;
using CreditApp.Application.Chat.Models;
using CreditApp.Application.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CreditApp.Infrastructure.Anthropic;

public class AnthropicClient : IAnthropicClient
{
    private readonly HttpClient _httpClient;
    private readonly AnthropicSettings _settings;
    private readonly ILogger<AnthropicClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    public AnthropicClient(
        HttpClient httpClient,
        IOptions<AnthropicSettings> settings,
        ILogger<AnthropicClient> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<ChatResponse> SendAsync(ChatRequest request, CancellationToken cancellationToken = default)
    {
        // Defaults applied here so callers don't have to think about them.
        if (string.IsNullOrEmpty(request.Model)) request.Model = _settings.Model;
        if (request.MaxTokens == 0) request.MaxTokens = _settings.MaxTokensPerResponse;

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/v1/messages")
        {
            Content = JsonContent.Create(request, options: JsonOptions),
        };

        using var httpResponse = await _httpClient.SendAsync(httpRequest, cancellationToken);

        if (!httpResponse.IsSuccessStatusCode)
        {
            var errorBody = await httpResponse.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Anthropic API returned {Status}: {Body}", httpResponse.StatusCode, errorBody);
            throw new InvalidOperationException(
                $"Anthropic API call failed with HTTP {(int)httpResponse.StatusCode}. See logs for details.");
        }

        var response = await httpResponse.Content.ReadFromJsonAsync<ChatResponse>(JsonOptions, cancellationToken);
        if (response == null)
            throw new InvalidOperationException("Anthropic API returned an empty response body.");

        return response;
    }
}
