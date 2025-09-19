// theme colors and styles for email
const THEME = {
  bg: "#fdf8ec",
  blue: "#0f3484",
  shadow: "0 4px 8px rgba(0,0,0,0.08)",
  borderWidth: "5px",
  radius: "15px",
  codeBg: "#eef3ff",
  codeBorder: "#cfdcff",
  subtle: "#24335f",
  meta: "#516183",
};

// CSS for email
function baseCss() {
  return `
    body, table, td, p { margin:0; padding:0; }
    img { border:0; outline:none; text-decoration:none; }
    a { color:${THEME.blue}; text-decoration:none; }
    body { background:${THEME.bg}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }

    .wrap { padding:24px 0; }

    .card {
      width:100%;
      max-width:560px;
      background:${THEME.bg};
      border:${THEME.borderWidth} solid ${THEME.blue};
      border-radius:${THEME.radius};
      box-shadow:${THEME.shadow};
    }

    .px { padding-left:28px; padding-right:28px; }
    .pt { padding-top:24px; }
    .pb { padding-bottom:26px; }

    .h1 { font-size:32px; }
    .lh { line-height:1.6; }

    .mono { letter-spacing:8px; font-size:28px; font-weight:bold; }

    /* Keep inner code table centered & safely inside the card */
    table.code-inner { width:96%; max-width:420px; margin:0 auto; }

    /* Media Queries */
    @media only screen and (max-width: 600px) {
      .wrap { padding:16px 0 !important; }
      .px { padding-left:20px !important; padding-right:20px !important; }
      .h1 { font-size:26px !important; }
      .mono { font-size:24px !important; letter-spacing:6px !important; }
    }

    @media only screen and (max-width: 480px) {
      .px { padding-left:14px !important; padding-right:14px !important; }
      /* shrink inner code table slightly for safety on phones */
      table.code-inner { width:94% !important; }
      .mono { font-size:22px !important; letter-spacing:5px !important; }
    }

    @media only screen and (max-width: 360px) {
      .px { padding-left:10px !important; padding-right:10px !important; }
      table.code-inner { width:92% !important; }
      .mono { font-size:20px !important; letter-spacing:4px !important; }
    }
  `;
}

// Google Fonts
function headFonts() {
  return `
    <link href="https://fonts.googleapis.com/css2?family=Calistoga&family=Lato:wght@400;700&display=swap" rel="stylesheet" />
    <style>${baseCss()}</style>
  `;
}

// Code tile component
function codeTile(code) {
  return `
    <!--[if mso]><center><![endif]-->
    <center>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
             class="code-inner" align="center" style="Margin:0 auto;">
        <tr>
          <td align="center"
              style="
                background:${THEME.codeBg};
                border:2px solid ${THEME.codeBorder};
                border-radius:12px;
                padding:22px 16px;
              ">
            <div class="mono"
                 style="display:inline-block; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; color:${THEME.blue};">
              ${code}
            </div>
          </td>
        </tr>
      </table>
    </center>
    <!--[if mso]></center><![endif]-->
  `;
}

// HTML
function frame({ subject, heading, subheading, name, lead, code, disclaimer }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${subject}</title>
    ${headFonts()}
  </head>
  
  <body>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="wrap">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" class="card">

           <!-- logo and subheading -->
            <tr>
              <td class="px pt" style="background: transparent; padding-bottom: 30px;">
                <table role= "presentation" width="100%" cellspacing= "0" cellpadding= "0">
                  <tr>
                    <td align="left">
                      <div style="
                          font-family:'Calistoga', Georgia, 'Times New Roman', serif;
                          color:${THEME.blue};
                          font-size:24px;
                          font-weight:bold;
                        ">
                        help n seek
                      </div>
                    </td>
                    <td align="right">
                      <div style="
                          font-family:'Calistoga', Georgia, 'Times New Roman', serif;
                          color:${THEME.blue};
                          font-size:18px;
                          font-weight:400;
                        ">
                        ${subheading}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- heading -->
            <tr>
              <td class="px">
                <h1 class="h1" style="margin:0; color:${THEME.blue}; font-weight:400;
                    font-family:'Calistoga', Georgia, 'Times New Roman', serif;">
                  ${heading}
                </h1>
              </td>
            </tr>

            <!-- greeting-->
            <tr>
              <td class="px" style="padding-top:10px;">
                <p class="lh" style="margin:0; color:${THEME.blue}; font-size:16px;
                    font-family:'Lato', Arial, Helvetica, sans-serif;">
                  Hi ${name || "there"},
                </p>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding-top:8px;">
                <p class="lh" style="margin:0; color:${THEME.blue}; font-size:16px;
                    font-family:'Lato', Arial, Helvetica, sans-serif;">
                  ${lead}
                </p>
              </td>
            </tr>

            <!-- Verification code -->
            <tr>
              <td class="px" style="padding-top:18px;" align="center">
                ${codeTile(code)}
              </td>
            </tr>

            <!-- Disclaimers -->
            <tr>
              <td class="px" style="padding-top:12px;">
                <p class="lh" style="margin:0; color:${THEME.blue}; font-size:14px;
                    font-family:'Lato', Arial, Helvetica, sans-serif;">
                  For your security, this code will expire in 30 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding-top:12px; padding-bottom:24px;">
                <p class="lh" style="margin:0; color:${THEME.subtle}; font-size:14px;
                    font-family:'Lato', Arial, Helvetica, sans-serif;">
                  ${disclaimer}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="px pb" style="border-top:${THEME.borderWidth} solid ${THEME.blue};">
                <p class="lh" style="margin:0; color:${THEME.meta}; font-size:14px;
                    font-family:'Lato', Arial, Helvetica, sans-serif; padding-top:20px;">
                  Help N Seek team<br />
                  <a href="mailto:helpnseek@gmail.com" style="color:${THEME.blue};">helpnseek@gmail.com</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Plain text version
function plain({ subject, heading, name, lead, code, disclaimer }) {
  return `${subject}

${heading}

Hi ${name || "there"},

${lead}

    ${code}

For your security, this code will expire in 30 minutes.
${disclaimer}

Help N Seek team
helpnseek@gmail.com`;
}

// Signup verification email template
export function renderSignupEmail({ name, code }) {
  const subject = "Help N Seek verification code";
  const subheading = "Verification Code";
  const heading = "Verify your email";
  const lead =
    "Thanks for signing up for Help N Seek. To verify your email, enter this code:";
  const disclaimer = "If you didn’t request this, you can safely ignore this message.";

  const html = frame({ subject, subheading, heading, name, lead, code, disclaimer });
  const text = plain({ subject, heading, name, lead, code, disclaimer });
  return { subject, html, text };
}

// Forgot password verification email template
export function renderForgotEmail({ name, code }) {
  const subject = "Help N Seek verification code";
  const subheading = "Verification Code";
  const heading = "Verify your email";
  const lead =
    "We received a request to reset your Help N Seek account password. To continue, please enter this code:";
  const disclaimer =
    "If you didn’t request a password reset, you can safely ignore this message and your account will remain secure.";

  const html = frame({ subject, subheading, heading, name, lead, code, disclaimer });
  const text = plain({ subject, heading, name, lead, code, disclaimer });
  return { subject, html, text };
}

// Send correct eamil based on different verifications
export function renderVerificationEmail({ kind, name, code }) {
  return kind === "forgot"
    ? renderForgotEmail({ name, code })
    : renderSignupEmail({ name, code });
}
