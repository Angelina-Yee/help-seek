import nodemailer from "nodemailer";

//load SMTP configuration
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

//create reuseable transporter to send emails
const transporter = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: user ? {user, pass} : undefined, 
  tls: {
    rejectUnauthorized: true
  }
});

//send email
export async function sendEmail({to, subject, html }) {
  const from = process.env.EMAIL_FROM || user;
  const info = await transporter. sendMail ({ from, to, subject, html});
  console.log("Email sent:", info.messageId);
  return info;
}
