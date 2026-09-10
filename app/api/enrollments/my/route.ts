export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    await connectDB();
    const token = cookies().get("student_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload?.email) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    // Lazy expiry: mark approved with past expiresAt as expired
    const now = new Date();
    await (Enrollment as any).updateMany(
      { $or: [{ studentId: payload.id }, { email: payload.email.toLowerCase() }], status: "approved", expiresAt: { $ne: null, $lt: now } },
      { $set: { status: "expired" } }
    );

    const list = await Enrollment.find({
      $or: [{ studentId: payload.id }, { email: payload.email.toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const data = list.map((d: any) => ({ ...d, id: String(d._id) }));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
