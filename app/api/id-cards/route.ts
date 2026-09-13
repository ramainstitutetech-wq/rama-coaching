export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import IDCard from "@/models/IDCard";
import Student from "@/models/Student";
import Course from "@/models/Course";

function genCardNo() {
  return `ID-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
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
      filter.$or = [{ studentName: regex }, { rollNo: regex }, { cardNumber: regex }, { courseName: regex }];
    }
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      IDCard.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      IDCard.countDocuments(filter),
    ]);
    const data = items.map((c: any) => ({
      id: String(c._id),
      cardNumber: c.cardNumber,
      studentName: c.studentName,
      fatherName: c.fatherName || "",
      motherName: c.motherName || "",
      rollNo: c.rollNo,
      courseName: c.courseName,
      courseCode: c.courseCode || "",
      batch: c.batch || "",
      dob: c.dob ? new Date(c.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      dobRaw: c.dob || null,
      phone: c.phone || "",
      address: c.address || "",
      photoUrl: c.photoUrl || "",
      issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      validTill: c.validTill ? new Date(c.validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      status: c.status,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error("[GET id-cards]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { studentId, rollNo, rollNumber, validTill } = body;
    const finalRoll = (rollNo || rollNumber || "").trim();
    let student: any = null;
    if (studentId?.trim()) student = await Student.findById(studentId.trim());
    else if (finalRoll) student = await Student.findOne({ rollNumber: finalRoll });
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    if (student.status !== "active") return NextResponse.json({ success: false, error: "Student not active — activate first" }, { status: 400 });

    // Check existing active card
    const existing = await IDCard.findOne({ studentId: student._id, status: "active", deletedAt: { $exists: false } });
    if (existing) return NextResponse.json({ success: false, error: "ID Card already exists for this student", data: existing }, { status: 409 });

    let courseDoc: any = null;
    if (student.courseId) courseDoc = await Course.findById(student.courseId);
    if (!courseDoc) {
      courseDoc = await Course.findOne({ name: student.courseName });
      if (!courseDoc) courseDoc = await Course.create({ name: student.courseName || "General", description: "Auto", duration: "12 Months", fees: "₹0", category: "General", status: "active" });
    }

    const cardNumber = body.cardNumber?.trim() || genCardNo();
    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    const vt = validTill ? new Date(validTill) : new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    const doc = await IDCard.create({
      cardNumber,
      studentId: student._id,
      courseId: courseDoc._id,
      studentName: student.fullName,
      fatherName: student.parentName || "",
      motherName: student.motherName || "",
      rollNo: student.rollNumber,
      courseName: courseDoc.name || student.courseName,
      courseCode: courseDoc.name?.replace(/\s+/g, "").slice(0, 8).toUpperCase() || "",
      batch: student.batch || "",
      dob: student.dob || undefined,
      phone: student.phone || "",
      address: student.address || "",
      photoUrl: student.photoUrl || "",
      issueDate,
      validTill: vt,
      status: "active",
      isSentToStudent: true,
    });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ success: false, error: "Card number exists" }, { status: 409 });
    console.error("[POST id-cards]", e);
    return NextResponse.json({ success: false, error: "Failed to create ID card" }, { status: 500 });
  }
}
