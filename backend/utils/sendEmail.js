import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: user ? {user, pass} : undefined, 
  tls: {
    rejectUnauthorized: true
  }
});

export async function sendEmail({to, subject, html }) {
  const from = process.env.EMAIL_FROM || user;
  const info = await transporter. sendMail ({ from, to, subject, html});
  console.log("Email sent:", info.messageId);
  return info;
}
