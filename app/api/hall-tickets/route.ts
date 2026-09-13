export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HallTicket from "@/models/HallTicket";
import Student from "@/models/Student";
import Course from "@/models/Course";

function genTicketNo() {
  return `HT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;
    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ studentName: regex }, { rollNo: regex }, { ticketNumber: regex }, { courseName: regex }, { examName: regex }];
    }
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      HallTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      HallTicket.countDocuments(filter),
    ]);
    const data = items.map((c: any) => ({
      id: String(c._id),
      ticketNumber: c.ticketNumber,
      studentName: c.studentName,
      fatherName: c.fatherName || "",
      motherName: c.motherName || "",
      rollNo: c.rollNo,
      courseName: c.courseName,
      courseCode: c.courseCode || "",
      batch: c.batch || "",
      examName: c.examName,
      examDate: c.examDate ? new Date(c.examDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      examDateRaw: c.examDate,
      examCenter: c.examCenter,
      examTime: c.examTime || "",
      hallNo: c.hallNo || "",
      photoUrl: c.photoUrl || "",
      signatureUrl: c.signatureUrl || "",
      status: c.status,
      isSentToStudent: !!c.isSentToStudent,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error("[GET hall-tickets]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, rollNo, rollNumber, examName, examDate, examCenter, examTime, hallNo, validTill } = body;
    const finalRoll = (rollNo || rollNumber || "").trim();
    const sid = studentId?.trim();
    let student: any = null;
    if (sid) student = await Student.findById(sid);
    else if (finalRoll) student = await Student.findOne({ rollNumber: finalRoll });
    if (!student) return NextResponse.json({ success: false, error: "Student not found (provide studentId or rollNo)" }, { status: 404 });
    if (!examName?.trim() || !examDate || !examCenter?.trim()) return NextResponse.json({ success: false, error: "Exam name, date, center required" }, { status: 400 });

    // Resolve course
    let courseDoc: any = null;
    if (student.courseId) courseDoc = await Course.findById(student.courseId);
    if (!courseDoc) {
      courseDoc = await Course.findOne({ name: student.courseName });
      if (!courseDoc) courseDoc = await Course.create({ name: student.courseName || "General", description: "Auto", duration: "12 Months", fees: "₹0", category: "General", status: "active" });
    }

    const ticketNumber = body.ticketNumber?.trim() || genTicketNo();
    const doc = await HallTicket.create({
      ticketNumber,
      studentId: student._id,
      courseId: courseDoc._id,
      studentName: student.fullName,
      fatherName: student.parentName || "",
      motherName: student.motherName || "",
      rollNo: student.rollNumber,
      courseName: courseDoc.name || student.courseName,
      courseCode: courseDoc.name?.replace(/\s+/g, "").slice(0, 8).toUpperCase() || "",
      batch: student.batch || "",
      examName: examName.trim(),
      examDate: new Date(examDate),
      examCenter: examCenter.trim(),
      examTime: examTime?.trim() || "10:00 AM",
      hallNo: hallNo?.trim() || "",
      photoUrl: student.photoUrl || "",
      status: "issued",
      isSentToStudent: true,
      validTill: validTill ? new Date(validTill) : new Date(examDate),
    });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ success: false, error: "Ticket number exists" }, { status: 409 });
    console.error("[POST hall-tickets]", e);
    return NextResponse.json({ success: false, error: "Failed to create hall ticket" }, { status: 500 });
  }
}
