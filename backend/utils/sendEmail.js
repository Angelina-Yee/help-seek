import nodemailer from "nodemailer";
import { renderVerificationEmail, renderSignupEmail, renderForgotEmail } from "./emails.js";

//Config from .env
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromDefault = process.env.EMAIL_FROM || (user ? `Help N Seek <${user}>` : "helpnseek@gmail.com");

// Reuseable transporter
export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user ? { user, pass } : undefined,
  tls: {
    rejectUnauthorized: true,
  },
});

// Verify connection configuration
if (process.env.NODE_ENV !== "production") {
  console.log("[mail] transporter created:", { host, port, user: user ? "****" : undefined });
}

// Send email
export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!to || !subject || !html) {
    throw new Error("sendEmail: 'to', 'subject', and 'html' are required");
  }

  const info = await transporter.sendMail({
    from: fromDefault,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[mail] sent:", info.messageId);
  }
  return info;
}

// Send verification email based on different kinds
export async function sendVerificationEmail(kind, { to, name = "", code, replyTo }) {
  const { subject, html, text } = renderVerificationEmail({ kind, name, code });
  return sendEmail({ to, subject, html, text, replyTo });
}

// Send signup verification email
export async function sendSignupCode({ to, name = "", code, replyTo }) {
  const { subject, html, text } = renderSignupEmail({ name, code });
  return sendEmail({ to, subject, html, text, replyTo });
}

// Send forgot password verification email
export async function sendForgotCode({ to, name = "", code, replyTo }) {
  const { subject, html, text } = renderForgotEmail({ name, code });
  return sendEmail({ to, subject, html, text, replyTo });
}