export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import StaffPermission from "@/models/StaffPermission";

export async function GET() {
  try {
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "staff") {
      return NextResponse.json({ success: false, error: "Not a staff account" }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(payload.id).select("-passwordHash").lean() as any;
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    let permDoc = await StaffPermission.findOne({ staffId: payload.id }).lean() as any;
    if (!permDoc) permDoc = { permissions: [] };

    return NextResponse.json({
      success: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        lastLoginAt: user.lastLoginAt || null,
        permissions: permDoc.permissions || [],
      },
    });
  } catch (e) {
    console.error("[staff/me]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
