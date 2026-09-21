import 'dotenv/config';
import nodemailer from 'nodemailer';

export interface EmailDispatchRecord {
  id: string;
  type: 'auth_confirmation' | 'customer_survey' | 'login_notification';
  to: string;
  recipientName?: string;
  subject: string;
  timestamp: string;
  status: 'sent' | 'simulated' | 'failed';
  previewUrl?: string | null;
  linkUrl: string;
  otpCode?: string;
  metadata?: Record<string, any>;
}

const dispatchHistory: EmailDispatchRecord[] = [];

// Helper to get or create transporter
async function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback: create a real Ethereal test account if no custom SMTP credentials exist
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch {
    // If ethereal is unreachable, use JSON transport fallback
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

/**
 * Sends a secure sign-in confirmation magic link email to the specified address.
 */
export async function sendAuthConfirmationEmail(params: {
  email: string;
  confirmationLink: string;
  otpCode?: string;
  companyName?: string;
}): Promise<{ success: boolean; messageId: string; previewUrl?: string | null }> {
  const { email, confirmationLink, otpCode, companyName = 'SHEQ Street QMS' } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1527; color: #334155; margin: 0; padding: 30px 10px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
        .header { background: #0c1527; padding: 28px 32px; text-align: left; border-bottom: 2px solid #1e3a8a; }
        .logo-text { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo-highlight { color: #f97316; }
        .badge { display: inline-block; background: rgba(249, 115, 22, 0.15); color: #f97316; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; margin-top: 6px; }
        .content { padding: 36px 32px; }
        h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); }
        .otp-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 16px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 24px; font-weight: 700; color: #1e293b; letter-spacing: 4px; }
        .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5; }
        .link-fallback { word-break: break-all; font-size: 12px; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">SHEQ <span class="logo-highlight">Street</span></div>
          <div class="badge">SECURE AUTHENTICATION</div>
        </div>
        <div class="content">
          <h1>Sign in to your ${companyName} Workspace</h1>
          <p>Hello,</p>
          <p>We received a sign-in request for <strong>${email}</strong>. Click the confirmation button below to verify your email and securely access your SHEQ Street Quality Management System:</p>
          
          <div class="btn-wrapper">
            <a href="${confirmationLink}" class="btn" target="_blank">Confirm &amp; Sign In</a>
          </div>

          ${otpCode
      ? `
          <div class="otp-box">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Or enter this 6-digit confirmation code:</div>
            <div class="otp-code">${otpCode}</div>
          </div>
          `
      : ''
    }

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            If the button doesn't work, copy and paste this confirmation link into your browser:<br>
            <a href="${confirmationLink}" class="link-fallback">${confirmationLink}</a>
          </p>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
            This confirmation link will expire in 15 minutes. If you did not request this email, no action is needed and you can safely ignore this message.
          </p>
        </div>
        <div class="footer">
          &copy; 2026 SHEQ Street Cloud Quality Management System. ISO 9001:2015 Compliant Security.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"SHEQ Street Security" <auth@sheqstreet.co.za>';

  const info = await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: `Your Sign-In Confirmation Link for ${companyName}`,
    text: `Sign in to SHEQ Street: Open this link to sign in: ${confirmationLink}${otpCode ? `\n\nYour 6-digit code: ${otpCode}` : ''
      }`,
    html: htmlContent,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  dispatchHistory.unshift({
    id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'auth_confirmation',
    to: email,
    subject: `Sign-In Confirmation Link for ${companyName}`,
    timestamp: new Date().toISOString(),
    status: 'sent',
    previewUrl,
    linkUrl: confirmationLink,
    otpCode,
  });

  console.log(`[EMAIL DISPATCH] Sent auth confirmation link to: ${email}`);
  if (previewUrl) {
    console.log(`[EMAIL DISPATCH] Ethereal Preview URL: ${previewUrl}`);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
  };
}

/**
 * Sends a customer satisfaction feedback survey invitation email to a customer.
 */
export async function sendCustomerSatisfactionSurveyEmail(params: {
  customerName: string;
  customerEmail: string;
  surveyUrl: string;
  companyName?: string;
}): Promise<{ success: boolean; messageId: string; previewUrl?: string | null }> {
  const { customerName, customerEmail, surveyUrl, companyName = 'nk' } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1527; color: #334155; margin: 0; padding: 30px 10px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
        .header { background: #0c1527; padding: 28px 32px; text-align: left; border-bottom: 2px solid #059669; }
        .logo-text { font-size: 20px; font-weight: 800; color: #ffffff; }
        .logo-highlight { color: #10b981; }
        .content { padding: 36px 32px; }
        h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px 0; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35); }
        .rating-preview { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5; }
        .link-fallback { word-break: break-all; font-size: 12px; color: #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">SHEQ <span class="logo-highlight">Street</span></div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">ISO 9001:2015 Quality Management</div>
        </div>
        <div class="content">
          <h1>Customer Satisfaction Survey</h1>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Thank you for partnering with <strong>${companyName}</strong>. As part of our ISO 9001:2015 continual improvement process, we value your feedback to ensure our products and services exceed your expectations.</p>
          <p>Please take 2 minutes to complete our brief 5-question customer satisfaction review:</p>

          <div class="rating-preview">
            <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 6px;">Evaluation Criteria:</div>
            <div style="font-size: 12px; color: #15803d; line-height: 1.5;">
              • Q1: Product &amp; Service Quality<br>
              • Q2: Delivery Timeliness &amp; Schedules<br>
              • Q3: Customer Communication &amp; Responsiveness<br>
              • Q4: Problem &amp; Non-Conformance Resolution<br>
              • Q5: Overall Value &amp; Commercial Satisfaction
            </div>
          </div>

          <div class="btn-wrapper">
            <a href="${surveyUrl}" class="btn" target="_blank">Start Feedback Survey</a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            If the button above does not work, please copy and open this link in your browser:<br>
            <a href="${surveyUrl}" class="link-fallback">${surveyUrl}</a>
          </p>
        </div>
        <div class="footer">
          Sent on behalf of ${companyName} Quality Assurance Team. Document #: NK-DC-007.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || `"${companyName} via SHEQ Street" <surveys@sheqstreet.co.za>`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: customerEmail,
    subject: `Customer Satisfaction Survey from ${companyName}`,
    text: `Dear ${customerName},\n\nPlease complete our customer satisfaction survey here: ${surveyUrl}\n\nThank you,\n${companyName}`,
    html: htmlContent,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;

  dispatchHistory.unshift({
    id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'customer_survey',
    to: customerEmail,
    recipientName: customerName,
    subject: `Customer Satisfaction Survey from ${companyName}`,
    timestamp: new Date().toISOString(),
    status: 'sent',
    previewUrl,
    linkUrl: surveyUrl,
  });

  console.log(`[EMAIL DISPATCH] Sent customer survey to: ${customerEmail} (${customerName})`);
  if (previewUrl) {
    console.log(`[EMAIL DISPATCH] Ethereal Preview URL: ${previewUrl}`);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
  };
}

/**
 * Sends a security login notification email to the user when they sign in to the platform.
 */
export async function sendLoginNotificationEmail(params: {
  email: string;
  name?: string;
  companyName?: string;
  loginTime?: string;
  deviceInfo?: string;
  ipAddress?: string;
  workspaceUrl?: string;
}): Promise<{ success: boolean; messageId: string; previewUrl?: string | null; timestamp: string }> {
  const {
    email,
    name = 'Valued User',
    companyName = 'NK Quality Systems',
    loginTime = new Date().toUTCString(),
    deviceInfo = 'Web Browser',
    ipAddress = '127.0.0.1',
    workspaceUrl = 'http://localhost:3000',
  } = params;

  const nowFormatted = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c1527; color: #334155; margin: 0; padding: 30px 10px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
        .header { background: #0c1527; padding: 26px 32px; text-align: left; border-bottom: 2px solid #2563eb; }
        .logo-text { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
        .logo-highlight { color: #f97316; }
        .badge { display: inline-block; background: rgba(37, 99, 235, 0.2); color: #60a5fa; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-top: 6px; border: 1px solid rgba(59, 130, 246, 0.3); }
        .content { padding: 36px 32px; }
        h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px 0; }
        .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748b; font-weight: 600; }
        .detail-value { color: #0f172a; font-weight: 700; text-align: right; }
        .status-pill { display: inline-block; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 11px; padding: 3px 10px; border-radius: 9999px; border: 1px solid #a7f3d0; }
        .btn-wrapper { text-align: center; margin: 28px 0 20px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
        .security-notice { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 24px; font-size: 12px; color: #1e40af; line-height: 1.5; }
        .warning-notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-top: 14px; font-size: 12px; color: #92400e; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">SHEQ <span class="logo-highlight">Street</span></div>
          <div class="badge">SECURITY SIGN-IN ALERT &bull; ISO 9001:2015</div>
        </div>
        <div class="content">
          <h1>Sign-In Notification</h1>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account was just used to successfully sign in to your <strong>SHEQ Street Quality Management System</strong> workspace.</p>
          
          <div class="details-card">
            <div class="detail-row">
              <span class="detail-label">User / Account:</span>
              <span class="detail-value">${email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Organization:</span>
              <span class="detail-value">${companyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Sign-In Time:</span>
              <span class="detail-value">${nowFormatted}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Client Device:</span>
              <span class="detail-value" style="max-width: 260px; word-break: break-word;">${deviceInfo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Security Protocol:</span>
              <span class="detail-value"><span class="status-pill">&bull; Authorized &amp; Active</span></span>
            </div>
          </div>

          <div class="btn-wrapper">
            <a href="${workspaceUrl}" class="btn" target="_blank">Access Your Workspace</a>
          </div>

          <div class="security-notice">
            <strong>Was this you?</strong> If you initiated this sign-in, you can safely disregard this message. Your session is active and compliant with ISO 9001:2015 access management standards.
          </div>

          <div class="warning-notice">
            <strong>Don't recognize this activity?</strong> If you did not sign in, please secure your account immediately by resetting your password or contacting your organization's quality management representative.
          </div>
        </div>
        <div class="footer">
          &copy; 2026 SHEQ Street Cloud Quality Management System. ISO 9001:2015 Compliant Security Audit Trail. Automated notification, do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;

  const transporter = await getTransporter();
  const fromAddress = process.env.SMTP_FROM || '"SHEQ Street Security" <nv8660970099@gmail.com>';
  const subject = `Security Alert: New Sign-In to SHEQ Street (${email})`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject,
    text: `Security Alert: New Sign-In to SHEQ Street QMS\n\nHello ${name},\n\nA successful sign-in was registered for ${email} at ${nowFormatted}.\nOrganization: ${companyName}\nClient: ${deviceInfo}\n\nIf this was you, no action is needed.\nIf you did not sign in, please reset your password immediately.\n\nSHEQ Street Security Team`,
    html: htmlContent,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  const timestamp = new Date().toISOString();

  dispatchHistory.unshift({
    id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'login_notification',
    to: email,
    recipientName: name,
    subject,
    timestamp,
    status: 'sent',
    previewUrl,
    linkUrl: workspaceUrl,
    metadata: {
      ip: ipAddress,
      userAgent: deviceInfo,
      loginTime,
    },
  });

  console.log(`[EMAIL DISPATCH] Sent login notification to: ${email}`);
  if (previewUrl) {
    console.log(`[EMAIL DISPATCH] Login Notification Preview URL: ${previewUrl}`);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
    timestamp,
  };
}

export function getEmailDispatchHistory(): EmailDispatchRecord[] {
  return [...dispatchHistory];
}
