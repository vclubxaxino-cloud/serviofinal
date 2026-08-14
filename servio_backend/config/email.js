import nodemailer from "nodemailer";

// Two ways to send email — pick whichever env vars are set.
//
// 1. Resend (recommended) — a plain HTTPS API call, so it works reliably
//    on Render/Railway. Traditional SMTP ports (587/465) are sometimes
//    blocked on free-tier cloud hosts, and Gmail in particular tends to
//    flag/block logins from cloud server IPs even with an App Password.
// 2. SMTP (Gmail, Brevo, SendGrid, etc.) — kept as a fallback for anyone
//    who already has SMTP credentials and prefers to use them directly.
//
// If neither is configured, email sending is skipped (logged to console)
// so the app still works without email set up.

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const emailMode = process.env.RESEND_API_KEY ? "resend" : transporter ? "smtp" : "none";

export default transporter;
