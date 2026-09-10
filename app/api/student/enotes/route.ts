export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import ENote from "@/models/ENote";

// GET /api/student/enotes
// Returns enrolled + free notes for the logged-in student's course category.
// Student must be authenticated via student_token cookie.
export async function GET(req: Request) {
  try {
    const token = cookies().get("student_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token) as any;
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const student = await Student.findOne({
      _id: payload.id,
      deletedAt: { $exists: false },
    }).lean() as any;

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const courseName = student.courseName || "";
    const { searchParams } = new URL(req.url);
    const catParam = searchParams.get("category") || courseName;

    // Build filter — show both free and enrolled-type notes for this student's category
    const filter: any = {
      deletedAt: { $exists: false },
      status: "active",
    };

    // If category provided use it, otherwise use student's course name
    if (catParam) filter.courseCategory = catParam;

    // Show both access types (student is enrolled so they see everything)
    // accessType filter is intentionally NOT applied — enrolled students see all

    const docs = await ENote.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const data = docs.map((doc: any) => ({
      id:             String(doc._id),
      title:          doc.title,
      description:    doc.description,
      courseCategory: doc.courseCategory,
      accessType:     doc.accessType,
      fileUrl:        doc.fileUrl  ?? "",
      content:        doc.content  ?? "",
      order:          doc.order    ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      studentCourse: courseName,
    });
  } catch (err) {
    console.error("[GET student/enotes]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
