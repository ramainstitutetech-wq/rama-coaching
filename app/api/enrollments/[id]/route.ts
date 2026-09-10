export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Student from "@/models/Student";

// PUT /api/enrollments/[id] { action: "approve" | "reject", reason? }
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload || !["admin", "staff"].includes(payload.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, reason } = body;
    if (!["approve", "reject"].includes(action)) return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

    const doc = await Enrollment.findById(params.id);
    if (!doc) return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 });
    if (doc.status !== "pending_verification") return NextResponse.json({ success: false, error: `Already ${doc.status}` }, { status: 400 });

    if (action === "approve") {
      doc.status = "approved";
      doc.verifiedBy = payload.id;
      doc.verifiedAt = new Date();
      // Set expiry based on course's accessDays
      try {
        const Course = (await import("@/models/Course")).default;
        const course = await Course.findById(doc.courseId).lean() as any;
        const days = course?.accessDays || 0;
        if (days > 0) {
          doc.enrolledAt = new Date();
          doc.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000) as any;
        } else {
          doc.enrolledAt = new Date();
          (doc as any).expiresAt = null;
        }
      } catch {}
      await doc.save();

      // If outsider → optionally auto-create Student? For now just mark approved, admin can manually create student via Students page.
      // If student type → you could update student's course here if needed (optional).

      return NextResponse.json({ success: true, message: "Approved", data: { id: String(doc._id), enrollmentId: doc.enrollmentId, status: doc.status } });
    } else {
      if (!reason || !String(reason).trim()) return NextResponse.json({ success: false, error: "Rejection reason required" }, { status: 400 });
      doc.status = "rejected";
      doc.rejectionReason = String(reason).trim();
      doc.verifiedBy = payload.id;
      doc.verifiedAt = new Date();
      await doc.save();
      return NextResponse.json({ success: true, message: "Rejected", data: { id: String(doc._id), status: doc.status } });
    }
  } catch (e) {
    console.error("[enrollments PUT]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// GET single
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const doc = await Enrollment.findById(params.id).lean() as any;
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { ...doc, id: String(doc._id) } });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
