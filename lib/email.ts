/**
 * Brevo Email Service - Transactional Reset Link
 * Uses Brevo HTTP API (https://api.brevo.com/v3/smtp/email)
 * Instant delivery within 1-2 seconds
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

interface SendResetEmailParams {
  to: string;
  name: string;
  resetLink: string;
  role: string;
}

export async function sendResetEmail({ to, name, resetLink, role }: SendResetEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY not configured in .env");
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@ramacoaching.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Rama Coaching Center";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1F3354;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Rama Coaching Center</h1>
      <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">And Computer Education Center</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:18px;">Password Reset Request</h2>
      <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 16px;">
        Hello <strong style="color:#1e293b;">${name}</strong>,<br>
        We received a request to reset your <strong>${role}</strong> account password. Click the button below to set a new password.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetLink}" style="display:inline-block;background:#1F3354;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;">Reset Password</a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:20px;margin:0 0 12px;">
        Or copy this link:<br>
        <a href="${resetLink}" style="color:#1F3354;word-break:break-all;">${resetLink}</a>
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin-top:20px;">
        <p style="color:#991b1b;font-size:12px;margin:0;line-height:18px;">
          ⏰ This link expires in <strong>15 minutes</strong>. If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rama Coaching Center, Fatehpur, UP &middot; Secure & Fast</p>
    </div>
  </div>
</body>
</html>`.trim();

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name }],
    subject: "Reset your password — Rama Coaching Center",
    htmlContent,
  };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("[brevo] send failed", res.status, data, "sender:", senderEmail);
    throw new Error(data?.message || `Brevo API error: ${res.status} - Check if sender ${senderEmail} is verified in Brevo dashboard`);
  }
  console.log("[brevo] email sent", data, "to", to);

  return data; // { messageId: "..." }
}

export async function sendOtpEmail({ to, name, otp, purpose }: { to: string; name: string; otp: string; purpose: "email_change" | "password_change" }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@expecto.online";
  const senderName = process.env.BREVO_SENDER_NAME || "Rama Coaching Center";
  const actionText = purpose === "email_change" ? "Email Change" : "Password Change";
  const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1F3354;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Rama Coaching Center</h1>
      <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">${actionText} Verification</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:18px;">Hello ${name},</h2>
      <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 16px;">
        Aapne apne admin account me <strong>${actionText}</strong> ka request kiya hai. Neeche diya gaya OTP use karke verify karein:
      </p>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#f8fafc;border:2px dashed #1F3354;border-radius:10px;padding:16px 32px;">
          <span style="font-size:28px;font-weight:800;letter-spacing:8px;color:#1F3354;">${otp}</span>
        </div>
      </div>
      <p style="color:#64748b;font-size:13px;text-align:center;margin:0 0 12px;">Ye OTP <strong>5 minute</strong> ke liye valid hai.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin-top:20px;">
        <p style="color:#991b1b;font-size:12px;margin:0;line-height:18px;">⚠️ Agar aapne ye request nahi kiya hai toh is email ko ignore karein. Aapka account safe hai.</p>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rama Coaching Center, Fatehpur, UP</p>
    </div>
  </div>
</body>
</html>`.trim();

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name }],
    subject: `${actionText} OTP — ${otp} — Rama Coaching`,
    htmlContent,
  };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[brevo otp] failed", res.status, data);
    throw new Error(data?.message || `Brevo error ${res.status}`);
  }
  console.log("[brevo otp] sent", data, "to", to);
  return data;
}

export async function sendActivationEmail({ to, name, email, password }: { to: string; name: string; email: string; password: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@expecto.online";
  const senderName = process.env.BREVO_SENDER_NAME || "Rama Coaching Center";
  const portalLink = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/login` : "https://rama-coaching.vercel.app/login";
  const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#1F3354;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Rama Coaching Center</h1>
      <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">And Computer Education Center</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:18px;">Account Activated! 🎉</h2>
      <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 16px;">
        Hello <strong style="color:#1e293b;">${name}</strong>,<br>
        Your registration request has been <strong style="color:#10b981;">accepted</strong> and your student account is now <strong>Active</strong>.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="color:#14532d;font-size:13px;font-weight:600;margin:0 0 8px;">Login Credentials:</p>
        <p style="color:#1e293b;font-size:13px;margin:4px 0;"><strong>Student Portal:</strong> <a href="${portalLink}" style="color:#1F3354;">${portalLink}</a></p>
        <p style="color:#1e293b;font-size:13px;margin:4px 0;"><strong>Email / Username:</strong> ${email}</p>
        <p style="color:#1e293b;font-size:13px;margin:4px 0;"><strong>Password:</strong> <span style="font-family:monospace;background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #bbf7d0;">${password}</span></p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${portalLink}" style="display:inline-block;background:#1F3354;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;">Login to Student Portal</a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:18px;margin:0;">Keep this email safe. You can change your password after login from your profile. For any help, contact us at 08299121689 / 7007482145.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rama Coaching Center, Fatehpur, UP</p>
    </div>
  </div>
</body>
</html>`.trim();

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name }],
    subject: "Account Activated - Registration Accepted! - Rama Coaching",
    htmlContent,
  };

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[brevo activation] failed", res.status, data);
    throw new Error(data?.message || `Brevo error ${res.status}`);
  }
  console.log("[brevo activation] sent to", to);
  return data;
}

export async function sendEnrollmentApprovedEmail({ to, name, courseName, enrollmentId }: { to: string; name: string; courseName: string; enrollmentId: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@expecto.online";
  const senderName = process.env.BREVO_SENDER_NAME || "Rama Coaching Center";
  const portalLink = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/student` : "https://rama-coaching.vercel.app/student";
  const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#10b981;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Payment Approved ✓</h1>
      <p style="color:#d1fae5;margin:6px 0 0;font-size:13px;">Rama Coaching Center</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:18px;">Hello ${name},</h2>
      <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 16px;">
        Your payment for <strong style="color:#1e293b;">${courseName}</strong> has been <strong style="color:#10b981;">approved</strong>!
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="color:#14532d;font-size:13px;margin:4px 0;"><strong>Enrollment ID:</strong> ${enrollmentId}</p>
        <p style="color:#14532d;font-size:13px;margin:4px 0;"><strong>Course:</strong> ${courseName}</p>
        <p style="color:#14532d;font-size:13px;margin:4px 0;"><strong>Status:</strong> Approved — You can now access course materials</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${portalLink}" style="display:inline-block;background:#1F3354;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;">Go to Student Portal</a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rama Coaching Center</p>
    </div>
  </div>
</body>
</html>`.trim();
  const payload = { sender: { name: senderName, email: senderEmail }, to: [{ email: to, name }], subject: `Payment Approved — ${courseName} — Rama Coaching`, htmlContent };
  const res = await fetch(BREVO_API_URL, { method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Brevo error ${res.status}`);
  console.log("[brevo enroll approved] sent to", to);
  return data;
}

export async function sendEnrollmentRejectedEmail({ to, name, courseName, enrollmentId, reason }: { to: string; name: string; courseName: string; enrollmentId: string; reason: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "hello@expecto.online";
  const senderName = process.env.BREVO_SENDER_NAME || "Rama Coaching Center";
  const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#dc2626;padding:28px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">Payment Not Approved</h1>
      <p style="color:#fecaca;margin:6px 0 0;font-size:13px;">Rama Coaching Center</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:18px;">Hello ${name},</h2>
      <p style="color:#64748b;font-size:14px;line-height:22px;margin:0 0 16px;">
        Your payment for <strong style="color:#1e293b;">${courseName}</strong> could not be verified.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="color:#991b1b;font-size:13px;margin:4px 0;"><strong>Enrollment ID:</strong> ${enrollmentId}</p>
        <p style="color:#991b1b;font-size:13px;margin:4px 0;"><strong>Reason:</strong> ${reason || "Please contact admin"}</p>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:20px;margin:0 0 16px;">Please verify your UTR and screenshot, or contact us at 08299121689 / 7007482145 / reply to this email. You can re-enroll after correction.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Rama Coaching Center</p>
    </div>
  </div>
</body>
</html>`.trim();
  const payload = { sender: { name: senderName, email: senderEmail }, to: [{ email: to, name }], subject: `Payment Not Approved — ${courseName} — Rama Coaching`, htmlContent };
  const res = await fetch(BREVO_API_URL, { method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Brevo error ${res.status}`);
  console.log("[brevo enroll rejected] sent to", to);
  return data;
}
