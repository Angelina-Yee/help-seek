import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined
});

export async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || "no-reply@example.test";
  const info = await transporter.sendMail({ from, to, subject, html });
  console.log("email sent:", info.messageId);
};