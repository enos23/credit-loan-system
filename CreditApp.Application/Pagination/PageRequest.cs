namespace CreditApp.Application.Pagination;

// Bound from query string via [FromQuery]. Setters clamp at the boundary so services
// and repositories always receive sane values.
public class PageRequest
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 1000;

    private int _page = 1;
    private int _pageSize = DefaultPageSize;

    public int Page
    {
        get => _page;
        set => _page = Math.Max(1, value);
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, MaxPageSize);
    }

    public string? Search { get; set; }
}
