namespace CreditApp.Domain.Entities;

// One row per user. Created lazily on first GET if missing (no need to seed).
// Cascade delete with User — preferences are meaningless without the user.
public class UserPreference
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Notifications — currently persist only (no email infrastructure yet, no in-app
    // notifications. When email lands in step 4, these flags gate the sends.)
    public bool NotifyEmailNewRequest { get; set; } = true;
    public bool NotifyEmailDecision { get; set; } = true;
    public bool NotifyBrowserAlerts { get; set; } = false;
    public bool NotifyWeeklyReport { get; set; } = true;

    // Localization — currently persist only (full i18n wiring is a separate effort).
    public string Language { get; set; } = "ro";
    public string DateFormat { get; set; } = "dd/mm/yyyy";

    // Display — itemsPerPage IS wired into ClientsPage/CreditRequestsPage as the
    // default page size. Theme is persist-only for now.
    public int ItemsPerPage { get; set; } = 10;
    public string Theme { get; set; } = "light";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
