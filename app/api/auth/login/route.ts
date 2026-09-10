export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "inactive") {
      return NextResponse.json({ success: false, error: "Account is deactivated" }, { status: 403 });
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ id: String(user._id), email: user.email, role: user.role, name: user.name });

    const res = NextResponse.json({
      success: true,
      data: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set("rama_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
