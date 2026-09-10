export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Student from "@/models/Student";

// GET /api/auth/verify-reset-token?token=xxx&email=yyy
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json({ success: false, error: "Token and email required" }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");

    let target: any = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("email");

    if (!target) {
      target = await Student.findOne({
        email: cleanEmail,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
        deletedAt: { $exists: false },
      }).select("email");
    }

    if (!target) {
      return NextResponse.json({ success: false, error: "Invalid or expired link" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Token valid" });
  } catch (err) {
    console.error("[verify-reset-token]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
