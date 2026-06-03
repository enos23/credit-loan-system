namespace CreditApp.Application.DTOs.Users;

// Used for both GET (response) and PUT (request) — same shape.
public class UserPreferencesDto
{
    public bool NotifyEmailNewRequest { get; set; }
    public bool NotifyEmailDecision { get; set; }
    public bool NotifyBrowserAlerts { get; set; }
    public bool NotifyWeeklyReport { get; set; }
    public string Language { get; set; } = "ro";
    public string DateFormat { get; set; } = "dd/mm/yyyy";
    public int ItemsPerPage { get; set; } = 10;
    public string Theme { get; set; } = "light";
}
