namespace CreditApp.Application.Email;

// Fire-and-forget by contract: callers don't await delivery, they call Enqueue and
// move on. Failures are logged by the implementation, never thrown back.
public interface IEmailService
{
    void Enqueue(EmailMessage message);
}
