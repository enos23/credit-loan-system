using System.Globalization;
using System.Net;

namespace CreditApp.Application.Email;

// Static factories that turn business data into ready-to-send EmailMessage instances.
// HTML uses inline styles so receivers (which strip <style> tags) render correctly.
// All user-provided values are HtmlEncoded to avoid injection in HTML; plain text
// versions are kept verbatim.
public static class EmailTemplates
{
    private static readonly CultureInfo Ro = new("ro-RO");

    public static EmailMessage ResetPassword(string toEmail, string toName, string resetToken, string frontendBaseUrl)
    {
        var link = $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={WebUtility.UrlEncode(resetToken)}";
        var safeName = WebUtility.HtmlEncode(toName);
        var safeLink = WebUtility.HtmlEncode(link);

        var html = $$"""
            <!DOCTYPE html>
            <html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f9;padding:32px 16px;margin:0;">
              <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
                <h1 style="color:#1c1c1c;font-size:22px;margin:0 0 16px 0;font-weight:700;">Resetare parolă</h1>
                <p style="color:#475569;line-height:1.6;margin:0 0 24px 0;">Bună, {{safeName}}.</p>
                <p style="color:#475569;line-height:1.6;margin:0 0 24px 0;">Am primit o cerere de resetare a parolei pentru contul tău CreditWise. Apasă butonul de mai jos pentru a continua:</p>
                <p style="text-align:center;margin:32px 0;"><a href="{{safeLink}}" style="background:#4f46e5;color:white;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">Resetează parola</a></p>
                <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 8px 0;">Codul expiră în <strong>1 oră</strong>. Dacă nu ai cerut tu această resetare, ignoră acest email — parola rămâne neschimbată.</p>
                <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:24px 0 0 0;">Dacă butonul nu funcționează, copiază acest link în browser:<br><span style="color:#475569;word-break:break-all;">{{safeLink}}</span></p>
              </div>
            </body></html>
            """;

        var plain = $"""
            Bună, {toName}.

            Am primit o cerere de resetare a parolei pentru contul tău CreditWise.
            Deschide următorul link pentru a continua:

            {link}

            Codul expiră în 1 oră. Dacă nu ai cerut tu această resetare, ignoră
            acest email — parola rămâne neschimbată.

            — CreditWise
            """;

        return new EmailMessage
        {
            ToEmail = toEmail,
            ToName = toName,
            Subject = "Resetare parolă CreditWise",
            HtmlBody = html,
            PlainTextBody = plain,
        };
    }

    public static EmailMessage DecisionMade(
        string toEmail,
        string toName,
        bool approved,
        decimal amount,
        decimal? approvedAmount,
        decimal? interestRate,
        int termMonths)
    {
        var safeName = WebUtility.HtmlEncode(toName);
        var statusLabel = approved ? "aprobată" : "respinsă";
        var statusColor = approved ? "#10b981" : "#ef4444";
        var statusBg = approved ? "#ecfdf5" : "#fef2f2";

        var detailsHtml = approved && approvedAmount.HasValue && interestRate.HasValue
            ? $"""
                <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Sumă solicitată</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{amount.ToString("N2", Ro)} RON</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Sumă aprobată</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{approvedAmount.Value.ToString("N2", Ro)} RON</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Dobândă</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{interestRate.Value.ToString("N2", Ro)}%</td></tr>
                  <tr><td style="padding:10px 0;color:#64748b;">Durată</td><td style="padding:10px 0;text-align:right;font-weight:600;color:#1e293b;">{termMonths} luni</td></tr>
                </table>
              """
            : "";

        var html = $$"""
            <!DOCTYPE html>
            <html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f9;padding:32px 16px;margin:0;">
              <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
                <h1 style="color:#1c1c1c;font-size:22px;margin:0 0 16px 0;font-weight:700;">Decizie cerere de credit</h1>
                <p style="color:#475569;line-height:1.6;margin:0 0 16px 0;">Bună, {{safeName}}.</p>
                <p style="color:#475569;line-height:1.6;margin:0 0 16px 0;">Cererea ta de credit a fost <strong style="color:{{statusColor}};background:{{statusBg}};padding:2px 8px;border-radius:4px;">{{statusLabel}}</strong>.</p>
                {{detailsHtml}}
                <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:24px 0 0 0;">Pentru detalii suplimentare, contactează banca sau analistul tău.</p>
              </div>
            </body></html>
            """;

        var detailsPlain = approved && approvedAmount.HasValue && interestRate.HasValue
            ? $"""

                Sumă solicitată: {amount.ToString("N2", Ro)} RON
                Sumă aprobată: {approvedAmount.Value.ToString("N2", Ro)} RON
                Dobândă: {interestRate.Value.ToString("N2", Ro)}%
                Durată: {termMonths} luni
                """
            : "";

        var plain = $"""
            Bună, {toName}.

            Cererea ta de credit a fost {statusLabel}.
            {detailsPlain}

            Pentru detalii suplimentare, contactează banca sau analistul tău.

            — CreditWise
            """;

        return new EmailMessage
        {
            ToEmail = toEmail,
            ToName = toName,
            Subject = approved ? "Cererea ta de credit a fost aprobată" : "Decizie cerere de credit",
            HtmlBody = html,
            PlainTextBody = plain,
        };
    }

    public static EmailMessage NewRequestForAnalyst(
        string toEmail,
        string toName,
        string clientFullName,
        decimal amount,
        int termMonths,
        string purpose,
        int creditScore,
        string riskLevel,
        string frontendBaseUrl)
    {
        var link = $"{frontendBaseUrl.TrimEnd('/')}/decisions";
        var safeName = WebUtility.HtmlEncode(toName);
        var safeClient = WebUtility.HtmlEncode(clientFullName);
        var safePurpose = WebUtility.HtmlEncode(purpose);
        var safeLink = WebUtility.HtmlEncode(link);
        var riskColor = riskLevel switch
        {
            "Low" => "#10b981",
            "Medium" => "#f59e0b",
            _ => "#ef4444",
        };
        var riskLabel = riskLevel switch
        {
            "Low" => "Scăzut",
            "Medium" => "Mediu",
            "High" => "Ridicat",
            _ => riskLevel,
        };

        var html = $$"""
            <!DOCTYPE html>
            <html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f9;padding:32px 16px;margin:0;">
              <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.04);">
                <h1 style="color:#1c1c1c;font-size:22px;margin:0 0 16px 0;font-weight:700;">Cerere nouă de credit</h1>
                <p style="color:#475569;line-height:1.6;margin:0 0 24px 0;">Bună, {{safeName}}. O cerere nouă așteaptă analiza ta.</p>
                <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Client</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{{safeClient}}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Sumă</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{{amount.ToString("N2", Ro)}} RON</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Durată</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{{termMonths}} luni</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Scop</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{{safePurpose}}</td></tr>
                  <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Scor credit</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1e293b;">{{creditScore}}/100</td></tr>
                  <tr><td style="padding:10px 0;color:#64748b;">Nivel risc</td><td style="padding:10px 0;text-align:right;font-weight:600;color:{{riskColor}};">{{riskLabel}}</td></tr>
                </table>
                <p style="text-align:center;margin:32px 0;"><a href="{{safeLink}}" style="background:#4f46e5;color:white;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block;">Deschide panoul analist</a></p>
              </div>
            </body></html>
            """;

        var plain = $"""
            Bună, {toName}. O cerere nouă așteaptă analiza ta.

            Client: {clientFullName}
            Sumă: {amount.ToString("N2", Ro)} RON
            Durată: {termMonths} luni
            Scop: {purpose}
            Scor credit: {creditScore}/100
            Nivel risc: {riskLabel}

            Deschide panoul analist: {link}

            — CreditWise
            """;

        return new EmailMessage
        {
            ToEmail = toEmail,
            ToName = toName,
            Subject = $"Cerere nouă: {clientFullName} — {amount.ToString("N0", Ro)} RON",
            HtmlBody = html,
            PlainTextBody = plain,
        };
    }
}
