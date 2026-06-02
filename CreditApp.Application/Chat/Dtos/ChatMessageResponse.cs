namespace CreditApp.Application.Chat.Dtos;

public class ChatMessageResponse
{
    public string Reply { get; set; } = string.Empty;
    public List<ToolCallTrace> ToolCalls { get; set; } = new();
    public ChatUsageSummary Usage { get; set; } = new();
}

public class ToolCallTrace
{
    public string Name { get; set; } = string.Empty;
    public string Arguments { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public bool IsError { get; set; }
}

public class ChatUsageSummary
{
    public int InputTokens { get; set; }
    public int OutputTokens { get; set; }
    public int CacheReadTokens { get; set; }
    public int CacheWriteTokens { get; set; }
    public int Iterations { get; set; }
    public int ToolCallCount { get; set; }
}
