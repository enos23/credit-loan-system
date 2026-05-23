namespace CreditApp.Application.Exceptions;

// See NotFoundException for the rationale on inheriting InvalidOperationException.
public class ConflictException : InvalidOperationException
{
    public ConflictException(string message) : base(message) { }
}
