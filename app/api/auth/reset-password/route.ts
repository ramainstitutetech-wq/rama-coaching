export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";
import { hashPassword } from "@/lib/auth";

// POST /api/auth/reset-password { token, email, password }
export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json({ success: false, error: "Token, email and new password are required" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");

    // Try User first, then Student
    let target: any = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    let isStudent = false;
    if (!target) {
      target = await Student.findOne({
        email: cleanEmail,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
        deletedAt: { $exists: false },
      });
      isStudent = !!target;
    }

    if (!target) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Update password
    target.passwordHash = await hashPassword(String(password));
    target.resetPasswordToken = null;
    target.resetPasswordExpires = null;
    await target.save();

    return NextResponse.json({ success: true, message: "Password reset successful. Please login." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
