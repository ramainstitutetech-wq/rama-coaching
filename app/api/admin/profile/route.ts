export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

// GET — fetch current admin profile
export async function GET() {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    return NextResponse.json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: (user as any).avatarUrl || null,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (e) {
    console.error("[profile GET]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT — update name / avatarUrl only. Email & password now require OTP via /request-otp + /verify-otp
export async function PUT(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { name, avatarUrl, currentPassword, newPassword, email } = body;

    // Block direct email/password changes — must use OTP flow
    if (email || newPassword || currentPassword) {
      return NextResponse.json({ success: false, error: "Email and password changes require OTP verification. Please use the OTP flow." }, { status: 400 });
    }

    // Update name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update avatar
    if (avatarUrl !== undefined) {
      (user as any).avatarUrl = avatarUrl;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: (user as any).avatarUrl || null,
      },
    });
  } catch (e) {
    console.error("[profile PUT]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
