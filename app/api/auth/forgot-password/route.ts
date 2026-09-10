export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import { sendResetEmail } from "@/lib/email";

// POST /api/auth/forgot-password { email, role? }
// role is optional - we auto-detect. If provided, we scope search.
export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, role } = await req.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const normalizedRole = role ? String(role).toLowerCase() : null;

    let target: any = null;
    let targetType: "user" | "student" = "user";
    let displayName = "";

    // Determine where to search
    if (normalizedRole === "student") {
      target = await Student.findOne({ email: cleanEmail, deletedAt: { $exists: false } });
      if (target) { targetType = "student"; displayName = target.fullName; }
    } else if (normalizedRole === "admin" || normalizedRole === "staff") {
      target = await User.findOne({ email: cleanEmail });
      if (target) { displayName = target.name; }
    } else {
      // Auto-detect: try User first, then Student
      target = await User.findOne({ email: cleanEmail });
      if (target) {
        displayName = target.name;
        targetType = "user";
      } else {
        target = await Student.findOne({ email: cleanEmail, deletedAt: { $exists: false } });
        if (target) {
          displayName = target.fullName;
          targetType = "student";
        }
      }
    }

    if (!target) {
      console.log(`[forgot-password] email not found: ${cleanEmail} (role: ${normalizedRole})`);
      return NextResponse.json({ success: false, error: `No account found with email ${cleanEmail}. Please check email or role.` }, { status: 404 });
    }

    if (target.status === "inactive") {
      return NextResponse.json({ success: false, error: "Account is deactivated. Contact admin." }, { status: 403 });
    }

    // Generate raw token (unhashed sent via email, hashed stored in DB)
    const rawToken = crypto.randomBytes(32).toString("hex"); // 64 chars
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    target.resetPasswordToken = hashedToken;
    target.resetPasswordExpires = expires;
    await target.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`[forgot-password] sending reset link to ${cleanEmail} via Brevo, link: ${resetLink}`);
    try {
      const brevoRes = await sendResetEmail({
        to: cleanEmail,
        name: displayName || cleanEmail,
        resetLink,
        role: targetType === "student" ? "Student" : target.role || "User",
      });
      console.log(`[forgot-password] Brevo success for ${cleanEmail}`, brevoRes);
    } catch (mailErr: any) {
      console.error("[forgot-password] Brevo failed for", cleanEmail, mailErr?.message || mailErr);
      return NextResponse.json({ success: false, error: `Failed to send email: ${mailErr?.message || "Brevo error"}. Check sender verification.` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
