namespace CRM.Core.Helpers;

public static class EmailTemplateBuilder
{
    private static string GetBaseTemplate(string title, string content, string ctaButton = "", string ctaLink = "")
    {
        var ctaHtml = "";
        if (!string.IsNullOrEmpty(ctaButton) && !string.IsNullOrEmpty(ctaLink))
        {
            ctaHtml = $@"
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{ctaLink}' style='background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>
                        {ctaButton}
                    </a>
                </div>";
        }

        return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body {{ font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px 20px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }}
                .content {{ padding: 30px; color: #334155; line-height: 1.6; font-size: 16px; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>{title}</h1>
                </div>
                <div class='content'>
                    {content}
                    {ctaHtml}
                </div>
                <div class='footer'>
                    <p>This is an automated message from your Smart CRM System.</p>
                    <p>&copy; {DateTime.UtcNow.Year} Smart CRM. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    public static string BuildWelcomeEmail(string fullName, string email, string tempPassword, string loginUrl)
    {
        var content = $@"
            <p>Hi <strong>{fullName}</strong>,</p>
            <p>An administrator has created a new account for you on the Smart CRM Platform.</p>
            <p>You can use the following credentials to access your workspace:</p>
            <div style='background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>Email:</strong> {email}</p>
                <p style='margin: 0;'><strong>Temporary Password:</strong> <code style='background: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>{tempPassword}</code></p>
            </div>
            <p style='color: #ef4444; font-size: 14px;'><em>Please ensure you change your password immediately after logging in for the first time.</em></p>
        ";

        return GetBaseTemplate("Welcome to Smart CRM!", content, "Login to your account", loginUrl);
    }

    public static string BuildClientReminderEmail(string clientName, string senderName, string customMessage)
    {
        var formattedMessage = customMessage.Replace("\n", "<br/>");
        
        var content = $@"
            <p>Dear <strong>{clientName}</strong>,</p>
            <div style='padding: 20px; border-left: 4px solid #6366f1; background-color: #f8fafc; margin: 20px 0; border-radius: 0 8px 8px 0;'>
                <p style='margin: 0;'>{formattedMessage}</p>
            </div>
            <p>Best regards,<br/><strong>{senderName}</strong></p>
        ";

        return GetBaseTemplate("Important Update regarding your Account", content);
    }
}
