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

// PUT — update staff name / status / password
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    const body = await req.json();
    const user = await User.findOne({ _id: params.id, role: "staff", deletedAt: { $exists: false } });
    if (!user) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });

    if (body.name?.trim()) user.name = body.name.trim();
    if (body.status) user.status = body.status;
    if (body.password) {
      if (body.password.length < 6) return NextResponse.json({ success: false, error: "Password too short" }, { status: 400 });
      user.passwordHash = await hashPassword(body.password);
    }

    await user.save();
    return NextResponse.json({ success: true, data: { id: String(user._id), name: user.name, email: user.email, status: user.status } });
  } catch (e) {
    console.error("[staff PUT]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE — soft delete staff account
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { _id: params.id, role: "staff", deletedAt: { $exists: false } },
      { deletedAt: new Date(), status: "inactive" },
      { new: true }
    );
    if (!user) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Staff account deleted" });
  } catch (e) {
    console.error("[staff DELETE]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
