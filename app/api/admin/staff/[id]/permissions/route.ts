export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import StaffPermission, { STAFF_PAGES } from "@/models/StaffPermission";
import User from "@/models/User";

function getRole() {
  const token = cookies().get("rama_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.role || null;
}

// GET — fetch permissions for a staff member (used by staff panel too)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const role = getRole();
  if (!role) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();
    let doc = await StaffPermission.findOne({ staffId: params.id }).lean() as any;
    if (!doc) {
      // Auto-create empty permissions doc
      doc = await StaffPermission.create({ staffId: params.id, permissions: [] });
    }
    return NextResponse.json({ success: true, data: doc.permissions || [] });
  } catch (e) {
    console.error("[permissions GET]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT — save full permissions array (admin only)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (getRole() !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  try {
    await connectDB();

    // Confirm staff exists
    const user = await User.findOne({ _id: params.id, role: "staff", deletedAt: { $exists: false } });
    if (!user) return NextResponse.json({ success: false, error: "Staff not found" }, { status: 404 });

    const { permissions } = await req.json();

    // Validate & sanitize
    const sanitized = STAFF_PAGES.map((page) => {
      const incoming = (permissions || []).find((p: any) => p.page === page);
      return {
        page,
        read:   incoming?.read   ?? false,
        write:  incoming?.write  ?? false,
        delete: incoming?.delete ?? false,
      };
    });

    const doc = await StaffPermission.findOneAndUpdate(
      { staffId: params.id },
      { permissions: sanitized },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: doc.permissions });
  } catch (e) {
    console.error("[permissions PUT]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
