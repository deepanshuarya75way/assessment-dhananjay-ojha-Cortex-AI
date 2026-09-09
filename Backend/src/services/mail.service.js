import nodemailer from 'nodemailer';
import env from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: 'gmail',
   auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    clientId: process.env.GOOGLE_CLIENT_ID,
  }
})

transporter.verify()
.then(() => {
  console.log('Ready to send emails');
})
.catch((error) => {
  console.error('Error verifying email transporter:', error);
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: "Perplexity <noreply@perplexity-piyush.in>",
      to,
      subject,
      html,
      ...(text && { text }),
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send failed:", error);
    throw new Error(error.message || "Failed to send email");
  }
}



// ─── Email HTML Template ────────────────────────────────────────────────────
// Usage: paste this html string into your mailer's html field
// Variables: ${username}, ${emailVerificationToken}
export const getVerificationEmailHtml = (username, emailVerificationToken) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>Verify your Perplexity account</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
 
    * { box-sizing: border-box; margin: 0; padding: 0; }
 
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 100%;
      background-color: #060608;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
 
    table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; display: block; max-width: 100%; }
    a { text-decoration: none; }
 
    /* ── Responsive ── */
    @media only screen and (max-width: 620px) {
      .outer-wrap  { padding: 20px 12px 40px !important; }
      .email-card  { border-radius: 20px !important; }
      .hero-cell   { padding: 40px 24px 36px !important; }
      .body-cell   { padding: 32px 24px 28px !important; }
      .footer-cell { padding: 20px 24px 28px !important; }
      .hero-h1     { font-size: 26px !important; letter-spacing: -0.02em !important; }
      .hero-sub    { font-size: 14px !important; }
      .cta-td      { display: block !important; width: 100% !important; }
      .cta-a       { display: block !important; text-align: center !important; padding: 15px 24px !important; }
      .info-cell-l { display: block !important; width: 100% !important; padding-right: 0 !important; padding-bottom: 10px !important; }
      .info-cell-r { display: block !important; width: 100% !important; padding-left: 0 !important; }
      .top-label   { font-size: 9px !important; letter-spacing: 0.16em !important; }
    }
  </style>
</head>
 
<body style="margin:0;padding:0;background-color:#060608;">
 
  <!-- Preheader ghost text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#060608;">
    Verify your email to start using Perplexity — one click and you're in.&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;
  </div>
 
  <!-- ════════════════════════════════ WRAPPER ════════════════════════════════ -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#060608;">
    <tr>
      <td class="outer-wrap" align="center" style="padding:40px 16px 56px;">
 
        <!-- ── Top eyebrow ── -->
        <p class="top-label" style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(45,212,191,0.4);margin-bottom:22px;">
          Perplexity &nbsp;·&nbsp; Account Verification
        </p>
 
        <!-- ════════ EMAIL CARD ════════ -->
        <table role="presentation" class="email-card" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;border-radius:28px;overflow:hidden;
                 background-color:#0c0c14;
                 border:1px solid rgba(255,255,255,0.07);
                 box-shadow:
                   0 0 0 1px rgba(45,212,191,0.05),
                   0 24px 60px rgba(0,0,0,0.7),
                   0 8px 24px rgba(0,0,0,0.4),
                   inset 0 1px 0 rgba(255,255,255,0.07);">
 
          <!-- ══════════ HERO ══════════ -->
          <tr>
            <td class="hero-cell" align="center"
              style="padding:60px 48px 52px;
                     background:
                       radial-gradient(ellipse 80% 60% at 50% -10%, rgba(45,212,191,0.12) 0%, transparent 65%),
                       linear-gradient(180deg, #0d1a17 0%, #0c0c14 100%);
                     border-bottom:1px solid rgba(255,255,255,0.05);
                     position:relative;overflow:hidden;">
 
              <!-- Decorative top shimmer line -->
              <div style="position:absolute;top:0;left:0;right:0;height:1px;
                background:linear-gradient(90deg,transparent 0%,rgba(45,212,191,0.4) 40%,rgba(45,212,191,0.7) 50%,rgba(45,212,191,0.4) 60%,transparent 100%);"></div>
 
              <!-- Corner glow -->
              <div style="position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;
                background:radial-gradient(circle,rgba(45,212,191,0.06) 0%,transparent 70%);pointer-events:none;"></div>
 
              <!-- Logo container -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="
                    width:64px;height:64px;border-radius:20px;
                    background:linear-gradient(145deg,#0a8070 0%,#2dd4bf 100%);
                    box-shadow:
                      0 0 0 1px rgba(45,212,191,0.3),
                      0 0 48px rgba(45,212,191,0.35),
                      0 12px 32px rgba(0,0,0,0.5);">
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA5TDE0IDRMMjQgOUwxNCA1TDQgOVoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNNCA5VjE5TDE0IDI0VjE0TDQgOVoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjUiLz48cGF0aCBkPSJNMjQgOVYxOUwxNCAyNFYxNEwyNCA5WiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNzUiLz48L3N2Zz4="
                      width="28" height="28" alt="P"
                      style="display:block;margin:18px auto 0;" />
                  </td>
                </tr>
              </table>
 
              <!-- Brand pill -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="
                    padding:4px 14px;border-radius:99px;
                    background:rgba(45,212,191,0.08);
                    border:1px solid rgba(45,212,191,0.2);">
                    <span style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(45,212,191,0.8);">
                      Perplexity
                    </span>
                  </td>
                </tr>
              </table>
 
              <!-- Headline -->
              <h1 class="hero-h1" style="
                font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
                font-size:36px;font-weight:800;letter-spacing:-0.03em;
                color:#eeeef8;line-height:1.15;margin:0 0 14px;">
                Verify your email
              </h1>
 
              <!-- Subline -->
              <p class="hero-sub" style="
                font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
                font-size:15px;font-weight:300;
                color:rgba(255,255,255,0.35);
                line-height:1.6;max-width:340px;margin:0 auto;">
                One click to activate your account and start exploring with AI.
              </p>
            </td>
          </tr>
 
          <!-- ══════════ BODY ══════════ -->
          <tr>
            <td class="body-cell" style="padding:44px 48px 40px;">
 
              <!-- Greeting -->
              <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:16px;font-weight:400;color:rgba(238,238,248,0.7);line-height:1.7;margin-bottom:10px;">
                Hey <strong style="color:#eeeef8;font-weight:700;">${username}</strong> 👋
              </p>
              <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14.5px;font-weight:300;color:rgba(238,238,248,0.42);line-height:1.85;margin-bottom:40px;">
                Welcome aboard. Tap the button below to confirm your email address.
                This link expires in <strong style="color:rgba(238,238,248,0.6);font-weight:500;">24 hours</strong>.
              </p>
 
              <!-- ── CTA BUTTON ── -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 44px;">
                <tr>
                  <td class="cta-td" align="center" style="
                    border-radius:16px;
                    background:linear-gradient(135deg,#0a8c78 0%,#2dd4bf 60%,#5eead4 100%);
                    box-shadow:
                      0 0 0 1px rgba(45,212,191,0.4),
                      0 0 40px rgba(45,212,191,0.28),
                      0 8px 24px rgba(0,0,0,0.45);">
                    <a class="cta-a"
                      href="https://perplexity-eeii.onrender.com/api/auth/verify-email?token=${emailVerificationToken}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:16px 52px;
                        font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
                        font-size:15px;font-weight:800;
                        letter-spacing:0.01em;
                        color:#03120f;
                        text-decoration:none;
                        border-radius:16px;
                        white-space:nowrap;">
                      ✓ &nbsp;Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
 
              <!-- ── Divider ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="width:40%;border-top:1px solid rgba(255,255,255,0.06);"></td>
                  <td style="padding:0 16px;white-space:nowrap;text-align:center;">
                    <span style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.14);">
                      or use this link
                    </span>
                  </td>
                  <td style="width:40%;border-top:1px solid rgba(255,255,255,0.06);"></td>
                </tr>
              </table>
 
              <!-- ── Fallback URL ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td style="
                    background:#07070e;
                    border:1px solid rgba(255,255,255,0.07);
                    border-left:3px solid rgba(45,212,191,0.35);
                    border-radius:12px;
                    padding:14px 18px;
                    word-break:break-all;">
                    <a href="https://perplexity-eeii.onrender.com/api/auth/verify-email?token=${emailVerificationToken}"
                      style="
                        font-family:'Courier New',Courier,monospace;
                        font-size:11px;
                        color:rgba(45,212,191,0.55);
                        text-decoration:none;
                        line-height:1.7;">
                      https://perplexity-eeii.onrender.com/api/auth/verify-email?token=${emailVerificationToken}
                    </a>
                  </td>
                </tr>
              </table>
 
              <!-- ── Info cards ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="info-cell-l" width="50%" style="padding-right:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="
                          background:#07070e;
                          border:1px solid rgba(255,255,255,0.06);
                          border-radius:14px;
                          padding:18px 18px 16px;
                          position:relative;overflow:hidden;">
                          <!-- accent corner -->
                          <div style="position:absolute;top:0;left:0;width:40px;height:2px;background:linear-gradient(90deg,rgba(45,212,191,0.6),transparent);border-radius:0 0 4px 0;"></div>
                          <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:rgba(45,212,191,0.45);margin-bottom:7px;">
                            ⏱ &nbsp;Expires In
                          </p>
                          <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:17px;font-weight:700;color:rgba(238,238,248,0.8);letter-spacing:-0.01em;">
                            24 hours
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="info-cell-r" width="50%" style="padding-left:8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="
                          background:#07070e;
                          border:1px solid rgba(255,255,255,0.06);
                          border-radius:14px;
                          padding:18px 18px 16px;
                          position:relative;overflow:hidden;">
                          <div style="position:absolute;top:0;left:0;width:40px;height:2px;background:linear-gradient(90deg,rgba(45,212,191,0.6),transparent);border-radius:0 0 4px 0;"></div>
                          <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:rgba(45,212,191,0.45);margin-bottom:7px;">
                            🔒 &nbsp;Security
                          </p>
                          <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:17px;font-weight:700;color:rgba(238,238,248,0.8);letter-spacing:-0.01em;">
                            Single-use
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
 
            </td>
          </tr>
 
          <!-- ══════════ FOOTER ══════════ -->
          <tr>
            <td class="footer-cell" style="padding:22px 48px 32px;border-top:1px solid rgba(255,255,255,0.04);">
 
              <!-- Divider shimmer -->
              <div style="width:48px;height:2px;margin:0 auto 20px;
                background:linear-gradient(90deg,transparent,rgba(45,212,191,0.3),transparent);border-radius:99px;"></div>
 
              <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:12px;font-weight:300;color:rgba(255,255,255,0.18);line-height:1.8;text-align:center;max-width:400px;margin:0 auto 14px;">
                Didn't sign up for Perplexity? You can safely ignore this email —
                your inbox was likely entered by mistake.
              </p>
              <p style="font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:11px;font-weight:400;color:rgba(255,255,255,0.1);text-align:center;letter-spacing:0.06em;">
                © 2026 Perplexity &nbsp;·&nbsp; Made with ♥ in India
              </p>
            </td>
          </tr>
 
        </table>
        <!-- /card -->
 
      </td>
    </tr>
  </table>
 
</body>
</html>
`;