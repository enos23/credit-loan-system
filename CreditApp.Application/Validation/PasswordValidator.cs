namespace CreditApp.Application.Validation;

public static class PasswordValidator
{
    public const int MinLength = 8;

    public static void EnsureValid(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < MinLength)
            throw new InvalidOperationException($"Parola trebuie să aibă cel puțin {MinLength} caractere.");

        bool hasLetter = false;
        bool hasDigit = false;
        foreach (var c in password)
        {
            if (char.IsLetter(c)) hasLetter = true;
            else if (char.IsDigit(c)) hasDigit = true;
            if (hasLetter && hasDigit) return;
        }

        throw new InvalidOperationException("Parola trebuie să conțină cel puțin o literă și o cifră.");
    }
}
