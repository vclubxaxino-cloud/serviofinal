import transporter, { emailMode } from "../config/email.js";

const FROM = process.env.SMTP_FROM || process.env.RESEND_FROM || "Servio <no-reply@servio.in>";

// Never throws — a failed/missing email should never break a booking
// action for the user. Errors are logged, not surfaced to the API caller.
async function sendMail({ to, subject, html }) {
  if (!to) return;

  if (emailMode === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to, subject, html }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[email failed via Resend] To: ${to} | ${res.status} ${body}`);
      }
    } catch (err) {
      console.error(`[email failed via Resend] To: ${to} | ${err.message}`);
    }
    return;
  }

  if (emailMode === "smtp") {
    try {
      await transporter.sendMail({ from: FROM, to, subject, html });
    } catch (err) {
      console.error(`[email failed via SMTP] To: ${to} | ${err.message}`);
    }
    return;
  }

  console.log(`[email skipped — no provider configured] To: ${to} | Subject: ${subject}`);
}

const wrap = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
    <h2 style="color:#12142B;margin-bottom:4px;">Servio</h2>
    <h3 style="color:#333;">${title}</h3>
    ${bodyHtml}
    <p style="color:#888;font-size:12px;margin-top:24px;">
      Questions? Reach us at +91 99920 94134.
    </p>
  </div>
`;

export const sendBookingSubmittedEmail = (user, booking) =>
  sendMail({
    to: user.email,
    subject: "Booking request received — Servio",
    html: wrap(
      "We've got your booking request",
      `<p>Hi ${user.name},</p>
       <p>Your request for <b>${booking.serviceTitle}</b> (${booking.package.label}) has been received
       and is being reviewed by our team. We'll notify you as soon as a partner is assigned.</p>`
    ),
  });

export const sendBookingAssignedEmail = (user, booking) =>
  sendMail({
    to: user.email,
    subject: "Partner assigned to your booking — Servio",
    html: wrap(
      "Your booking is confirmed!",
      `<p>Hi ${user.name},</p>
       <p><b>${booking.workerName}</b> has been assigned to your booking for
       <b>${booking.serviceTitle}</b>${booking.date ? ` on ${booking.date}` : ""}${booking.time ? ` at ${booking.time}` : ""}.</p>`
    ),
  });

export const sendBookingRejectedEmail = (user, booking) =>
  sendMail({
    to: user.email,
    subject: "Update on your booking — Servio",
    html: wrap(
      "We couldn't confirm this booking",
      `<p>Hi ${user.name},</p>
       <p>Unfortunately we couldn't find an available partner for your booking of
       <b>${booking.serviceTitle}</b> at the requested time. Please try booking again with a different
       time slot, or contact support for help.</p>`
    ),
  });

export const sendWorkDoneAwaitingPaymentEmail = (user, booking) =>
  sendMail({
    to: user.email,
    subject: "Please complete your payment — Servio",
    html: wrap(
      "Your service is done — please pay via UPI",
      `<p>Hi ${user.name},</p>
       <p>Your partner has marked <b>${booking.serviceTitle}</b> as finished. Please open the app,
       scan the Servio UPI QR code, pay <b>₹${booking.package.price.toLocaleString("en-IN")}</b>,
       and enter your UPI transaction reference to confirm — this platform is UPI-only,
       partners cannot accept cash.</p>`
    ),
  });

export const sendBookingCompletedEmail = (user, booking) =>
  sendMail({
    to: user.email,
    subject: "Payment confirmed — Servio",
    html: wrap(
      "Job done and payment confirmed! 🎉",
      `<p>Hi ${user.name},</p>
       <p>Your booking for <b>${booking.serviceTitle}</b> is complete and your UPI payment has
       been confirmed (Ref: ${booking.payment?.upiRef || "—"}). Thanks for booking with Servio!</p>`
    ),
  });

export const sendWorkerApprovedEmail = (worker) =>
  sendMail({
    to: worker.email,
    subject: "You're verified! — Servio Partner",
    html: wrap(
      "KYC approved",
      `<p>Hi ${worker.name},</p>
       <p>Your documents have been verified and your account is now approved.
       You can start receiving job assignments right away.</p>`
    ),
  });

export const sendWorkerRejectedEmail = (worker) =>
  sendMail({
    to: worker.email,
    subject: "Update on your application — Servio Partner",
    html: wrap(
      "KYC review update",
      `<p>Hi ${worker.name},</p>
       <p>We weren't able to verify your documents. Please contact support
       at +91 99920 94134 for details or to resubmit.</p>`
    ),
  });

export const sendPasswordResetEmail = (actor, resetUrl) =>
  sendMail({
    to: actor.email,
    subject: "Reset your Servio password",
    html: wrap(
      "Password reset requested",
      `<p>Hi ${actor.name},</p>
       <p>Click the button below to set a new password. This link expires in 1 hour.
       If you didn't request this, you can safely ignore this email.</p>
       <p style="margin:24px 0;">
         <a href="${resetUrl}" style="background:#B8862F;color:#12142B;padding:12px 24px;
           border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
           Reset Password
         </a>
       </p>
       <p style="color:#888;font-size:12px;">Or copy this link: ${resetUrl}</p>`
    ),
  });
