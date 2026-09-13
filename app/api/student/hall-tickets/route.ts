export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import HallTicket from "@/models/HallTicket";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get("student_token")?.value || cookieStore.get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    const studentId = payload.id || payload._id || payload.studentId;
    const items = await HallTicket.find({ studentId, status: { $ne: "cancelled" }, deletedAt: { $exists: false } }).sort({ examDate: -1 }).lean();
    const data = items.map((c: any) => ({
      id: String(c._id),
      ticketNumber: c.ticketNumber,
      examName: c.examName,
      examDate: c.examDate ? new Date(c.examDate).toLocaleDateString("en-IN") : "",
      examDateRaw: c.examDate,
      examCenter: c.examCenter,
      examTime: c.examTime,
      hallNo: c.hallNo,
      courseName: c.courseName,
      rollNo: c.rollNo,
      photoUrl: c.photoUrl || "",
      status: c.status,
    }));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[student hall-tickets]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
