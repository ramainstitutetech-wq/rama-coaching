export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

async function getAuthedUser() {
  const token = cookies().get("rama_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  await connectDB();
  return User.findById(payload.id);
}

// POST /api/admin/profile/verify-otp { otp, purpose }
export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { otp, purpose } = await req.json();
    if (!otp || !purpose) return NextResponse.json({ success: false, error: "OTP and purpose required" }, { status: 400 });

    if (!user.otpHash || !user.otpExpires || user.otpPurpose !== purpose) {
      return NextResponse.json({ success: false, error: "No OTP request found. Please request again." }, { status: 400 });
    }

    if (new Date() > user.otpExpires!) {
      (user as any).otpHash = undefined;
      (user as any).otpExpires = undefined;
      (user as any).otpPurpose = undefined;
      await user.save();
      return NextResponse.json({ success: false, error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    const hashed = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
    if (hashed !== user.otpHash) {
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }

    // OTP verified - apply change
    if (purpose === "email_change") {
      const newEmail = user.pendingEmail;
      if (!newEmail) return NextResponse.json({ success: false, error: "No pending email found" }, { status: 400 });
      // Double check uniqueness again
      const exists = await User.findOne({ email: newEmail });
      if (exists && String(exists._id) !== String(user._id)) {
        return NextResponse.json({ success: false, error: "Email already taken" }, { status: 409 });
      }
      const oldEmail = user.email;
      user.email = newEmail;
      console.log(`[verify-otp] Email changed ${oldEmail} -> ${newEmail} for admin ${user.name}`);
    } else if (purpose === "password_change") {
      const pendingHash = (user as any).pendingPasswordHash;
      if (!pendingHash) return NextResponse.json({ success: false, error: "No pending password found" }, { status: 400 });
      user.passwordHash = pendingHash;
      console.log(`[verify-otp] Password changed for ${user.email}`);
    }

    // Clear OTP fields
    (user as any).otpHash = undefined;
    (user as any).otpExpires = undefined;
    (user as any).otpPurpose = undefined;
    (user as any).pendingEmail = undefined;
    (user as any).pendingPasswordHash = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: purpose === "email_change" ? "Email updated successfully!" : "Password changed successfully!",
      data: { email: user.email, name: user.name },
    });
  } catch (e) {
    console.error("[verify-otp]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
