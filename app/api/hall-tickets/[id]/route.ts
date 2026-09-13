export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HallTicket from "@/models/HallTicket";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    let doc: any = null;
    try { doc = await HallTicket.findById(params.id).lean(); } catch {}
    if (!doc) doc = await HallTicket.findOne({ ticketNumber: params.id }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Hall Ticket not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        id: String(doc._id),
        ticketNumber: doc.ticketNumber,
        studentName: doc.studentName,
        fatherName: doc.fatherName || "",
        motherName: doc.motherName || "",
        rollNo: doc.rollNo,
        courseName: doc.courseName,
        batch: doc.batch || "",
        examName: doc.examName,
        examDate: doc.examDate ? new Date(doc.examDate).toLocaleDateString("en-IN") : "",
        examDateRaw: doc.examDate,
        examCenter: doc.examCenter,
        examTime: doc.examTime || "",
        hallNo: doc.hallNo || "",
        photoUrl: doc.photoUrl || "",
        status: doc.status,
      },
    });
  } catch (e) {
    console.error("[GET hall-ticket by id]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    let doc: any = null;
    try { doc = await HallTicket.findByIdAndUpdate(params.id, { deletedAt: new Date() }, { new: true }); } catch {}
    if (!doc) doc = await HallTicket.findOneAndUpdate({ ticketNumber: params.id }, { deletedAt: new Date() }, { new: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error("[DELETE hall-ticket]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
