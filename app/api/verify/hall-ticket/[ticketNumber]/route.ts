export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HallTicket from "@/models/HallTicket";

export async function GET(_req: Request, { params }: { params: { ticketNumber: string } }) {
  try {
    await connectDB();
    const doc = await HallTicket.findOne({
      ticketNumber: params.ticketNumber,
      deletedAt: { $exists: false },
    }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, valid: false, error: "Hall ticket not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        ticketNumber: doc.ticketNumber,
        studentName: doc.studentName,
        fatherName: doc.fatherName || "",
        rollNo: doc.rollNo,
        courseName: doc.courseName,
        batch: doc.batch || "",
        examName: doc.examName,
        examDate: doc.examDate ? new Date(doc.examDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        examCenter: doc.examCenter,
        examTime: doc.examTime || "",
        hallNo: doc.hallNo || "",
        status: doc.status,
        issuedAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      },
    });
  } catch (e) {
    console.error("[Verify hall-ticket]", e);
    return NextResponse.json({ success: false, valid: false, error: "Verification failed" }, { status: 500 });
  }
}
