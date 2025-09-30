import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || "no-reply@asi.local";

export function getTransport() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    // eslint-disable-next-line no-console
    console.warn("SMTP env vars missing (SMTP_HOST/SMTP_USER/SMTP_PASS). Emails will fail.");
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendVerificationEmail(params: {
  to: string;
  verifyUrl: string;
  startupName: string;
}) {
  const transporter = getTransport();
  const subject = "Verify your email for ASI";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Welcome to ASI, ${params.startupName}</h2>
      <p>Thanks for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${params.verifyUrl}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
  const text = `Welcome to ASI, ${params.startupName}\n\nVerify your email: ${params.verifyUrl}\nThis link expires in 24 hours.`;

  await transporter.sendMail({ from: fromEmail, to: params.to, subject, html, text });
}



