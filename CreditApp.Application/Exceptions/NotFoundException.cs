namespace CreditApp.Application.Exceptions;

// Inherits InvalidOperationException so existing controller catch blocks still work;
// the dedicated type lets new controllers (and a future global problem-details handler)
// map to HTTP 404 specifically.
public class NotFoundException : InvalidOperationException
{
    public NotFoundException(string message) : base(message) { }
}
