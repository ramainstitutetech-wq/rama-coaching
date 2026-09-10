export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import StaffPermission from "@/models/StaffPermission";

function isAdmin() {
  const token = cookies().get("rama_token")?.value;
  if (!token) return false;
  const p = verifyToken(token);
  return p?.role === "admin";
}

// GET — list all staff accounts with their permissions
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    const staffList = await User.find({
      role: "staff",
      deletedAt: { $exists: false },
    }).select("-passwordHash").lean();

    const perms = await StaffPermission.find({
      staffId: { $in: staffList.map((s: any) => s._id) },
    }).lean();

    const permMap: Record<string, any[]> = {};
    perms.forEach((p: any) => { permMap[String(p.staffId)] = p.permissions || []; });

    const data = staffList.map((s: any) => ({
      id: String(s._id),
      name: s.name,
      email: s.email,
      status: s.status,
      avatarUrl: s.avatarUrl || null,
      lastLoginAt: s.lastLoginAt || null,
      createdAt: s.createdAt,
      permissions: permMap[String(s._id)] || [],
    }));

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[staff GET]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST — create a new staff account
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    const { name, email, password, status = "active" } = await req.json();

    if (!name?.trim()) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "staff",
      status,
    });

    // Create empty permissions doc
    await StaffPermission.create({ staffId: user._id, permissions: [] });

    return NextResponse.json({
      success: true,
      data: { id: String(user._id), name: user.name, email: user.email, status: user.status },
    }, { status: 201 });
  } catch (e) {
    console.error("[staff POST]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
