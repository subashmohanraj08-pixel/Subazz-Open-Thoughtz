const nodemailer = require('nodemailer');

// Builds a transporter from env vars. If SMTP isn't configured (e.g. local dev
// without a mail provider), we fall back to a transporter that just logs to
// the console instead of throwing, so the app keeps working out of the box.
let transporter = null;
let usingRealSmtp = false;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    usingRealSmtp = true;
  } else {
    // Dev fallback: log the email instead of sending it.
    transporter = {
      sendMail: async (opts) => {
        console.log('\n================ [DEV EMAIL - SMTP NOT CONFIGURED] ================');
        console.log(`To: ${opts.to}`);
        console.log(`Subject: ${opts.subject}`);
        console.log(opts.text || opts.html);
        console.log('=====================================================================\n');
        return { messageId: 'dev-console-log' };
      },
    };
    usingRealSmtp = false;
  }

  return transporter;
}

async function sendPasswordResetEmail(toEmail, username, resetUrl) {
  const mailer = getTransporter();

  const subject = 'Reset your Subaz Open Thoughtz password';
  const text = `Hi ${username},\n\nWe received a request to reset your password. Click the link below to choose a new one. This link expires in 15 minutes.\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\n— Subaz Open Thoughtz`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a2e;">
      <h2 style="color: #5a1feb;">🪶 Subaz Open Thoughtz</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>15 minutes</strong>.</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg,#6d3bff,#ff5c33); color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 600;">Reset password</a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      <p style="font-size: 13px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || '"Subaz Open Thoughtz" <no-reply@subazopenthoughtz.com>',
    to: toEmail,
    subject,
    text,
    html,
  });

  return { sentViaRealSmtp: usingRealSmtp };
}

module.exports = { sendPasswordResetEmail };
