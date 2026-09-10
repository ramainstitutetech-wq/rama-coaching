export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyToken, hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/email";

async function getAuthedUser() {
  const token = cookies().get("rama_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  await connectDB();
  return User.findById(payload.id);
}

// POST /api/admin/profile/request-otp { purpose: "email_change" | "password_change", newEmail?, newPassword?, currentPassword? }
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { purpose, newEmail, newPassword, currentPassword } = body;

    if (!purpose || !["email_change", "password_change"].includes(purpose)) {
      return NextResponse.json({ success: false, error: "Invalid purpose" }, { status: 400 });
    }

    if (purpose === "email_change") {
      if (!newEmail || !String(newEmail).trim()) return NextResponse.json({ success: false, error: "New email is required" }, { status: 400 });
      const cleanNew = String(newEmail).toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNew)) return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
      if (cleanNew === user.email.toLowerCase()) return NextResponse.json({ success: false, error: "New email is same as current email" }, { status: 400 });
      const exists = await User.findOne({ email: cleanNew });
      if (exists) return NextResponse.json({ success: false, error: "This email is already in use" }, { status: 409 });
      // Also check Student email collision
      const { default: Student } = await import("@/models/Student");
      const sExists = await Student.findOne({ email: cleanNew });
      if (sExists) return NextResponse.json({ success: false, error: "This email is already used by a student account" }, { status: 409 });
    }

    if (purpose === "password_change") {
      if (!currentPassword || !newPassword) return NextResponse.json({ success: false, error: "Current and new password required" }, { status: 400 });
      if (String(newPassword).length < 6) return NextResponse.json({ success: false, error: "New password must be at least 6 characters" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    user.otpHash = otpHash;
    user.otpExpires = expires;
    user.otpPurpose = purpose;
    if (purpose === "email_change") {
      user.pendingEmail = String(newEmail).toLowerCase().trim();
    } else {
      // Need to verify currentPassword now itself to avoid OTP waste
      const { comparePassword } = await import("@/lib/auth");
      const ok = await comparePassword(String(currentPassword), user.passwordHash);
      if (!ok) return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
      (user as any).pendingPasswordHash = await hashPassword(String(newPassword));
      (user as any).pendingEmail = undefined; // ensure clean
    }

    await user.save();

    // Send OTP to CURRENT email (security)
    try {
      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        purpose,
      });
    } catch (e: any) {
      console.error("[request-otp] Brevo failed", e);
      return NextResponse.json({ success: false, error: "Failed to send OTP: " + (e.message || "Brevo error") }, { status: 500 });
    }

    console.log(`[request-otp] OTP ${otp} for ${user.email} purpose ${purpose} (hashed stored)`);

    return NextResponse.json({ success: true, message: `OTP sent to ${user.email} (valid for 5 minutes). Check spam folder too.` });
  } catch (e) {
    console.error("[request-otp]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
