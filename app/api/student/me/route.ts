export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function GET() {
  try {
    const token = cookies().get("student_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || (payload as any).role !== "student") return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    await connectDB();
    const student = await Student.findOne({ _id: (payload as any).id, deletedAt: { $exists: false } }).lean() as any;
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        id: String(student._id),
        fullName: student.fullName,
        rollNumber: student.rollNumber,
        email: student.email,
        phone: student.phone,
        course: student.courseName,
        courseId: String(student.courseId),
        courseName: student.courseName,
        batch: student.batch,
        admissionDate: student.admissionDate,
        photoUrl: student.photoUrl || "",
        avatarColor: student.avatarColor,
        status: student.status,
      },
    });
  } catch (e) {
    console.error("[student me]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
