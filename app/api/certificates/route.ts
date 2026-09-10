export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Student from "@/models/Student";
import Course from "@/models/Course";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type") || "";
    const courseFilter = searchParams.get("course") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter["$or"] = [{ studentName: regex }, { certificateNumber: regex }, { rollNo: regex }, { courseName: regex }];
    }
    if (type) filter["documentType"] = type;
    if (courseFilter) filter["courseName"] = courseFilter;
    if (status) filter["status"] = status;

    const [items, total] = await Promise.all([
      Certificate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Certificate.countDocuments(filter),
    ]);

    const data = items.map((c: any) => ({
      id: String(c["_id"]),
      certificateNumber: c["certificateNumber"],
      studentName: c["studentName"],
      rollNumber: c["rollNo"],
      rollNo: c["rollNo"],
      course: c["courseName"],
      courseName: c["courseName"],
      type: c["documentType"] || c["type"],
      documentType: c["documentType"],
      issueDate: c["issueDate"] ? new Date(c["issueDate"] as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      status: c["status"],
      isSentToStudent: !!c["isSentToStudent"],
      createdAt: c["createdAt"],
    }));

    return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("[GET certificates]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      certificateNumber, studentId, rollNo, rollNumber, studentName, fatherName, motherName,
      courseName, courseCode, courseId, enrollmentNo, slNo, completionDate, trainingCenter,
      centerCode, performance, courseDuration, photoUrl, documentType, type, dated, place, subjects, issueDate, status, isSentToStudent,
    } = body;

    const finalRollNo = (rollNo || rollNumber || "").trim();
    const finalCertNo = (certificateNumber || "").trim();
    const finalDocType = (documentType || type || "excellence").trim();
    const finalStudentName = (studentName || "").trim();
    const finalCourseName = (courseName || "").trim();

    if (!finalCertNo || !finalRollNo || !finalStudentName || !finalCourseName) {
      return NextResponse.json({ success: false, error: "Missing required certificate fields" }, { status: 400 });
    }

    // Resolve studentId
    let resolvedStudentId = studentId;
    if (!resolvedStudentId) {
      const st = await Student.findOne({ rollNumber: finalRollNo });
      if (st) resolvedStudentId = String(st._id);
      else {
        // create minimal student reference fallback? require studentId, so error
        return NextResponse.json({ success: false, error: "Student not found for roll number" }, { status: 404 });
      }
    }

    // Resolve courseId
    let resolvedCourseId = courseId;
    if (!resolvedCourseId) {
      let courseDoc = await Course.findOne({ name: finalCourseName });
      if (!courseDoc) {
        courseDoc = await Course.create({ name: finalCourseName, description: `${finalCourseName} course`, duration: courseDuration || "6 Months", fees: "₹0", category: "General", status: "active" });
      }
      resolvedCourseId = String(courseDoc._id);
    }

    // Parse dates
    const compDate = completionDate ? new Date(completionDate) : new Date();
    const issDate = issueDate ? new Date(issueDate) : new Date();

    const doc = await Certificate.create({
      certificateNumber: finalCertNo,
      studentId: resolvedStudentId,
      courseId: resolvedCourseId,
      documentType: finalDocType,
      type: finalDocType,
      slNo: slNo || finalCertNo.slice(-3),
      rollNo: finalRollNo,
      enrollmentNo: enrollmentNo || finalRollNo,
      studentName: finalStudentName,
      fatherName: fatherName || "",
      motherName: motherName || "",
      courseCode: courseCode || finalCourseName.replace(/\s+/g, "").toUpperCase() + "-2026",
      courseName: finalCourseName,
      completionDate: compDate,
      trainingCenter: trainingCenter || "Rama Coaching Center, Main Branch",
      centerCode: centerCode || "",
      performance: performance || "",
      courseDuration: courseDuration || "",
      photoUrl: photoUrl || "",
      issueDate: issDate,
      status: status || "issued",
      dated: dated || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      place: place || "Fatehpur",
      subjects: Array.isArray(subjects) ? subjects.map((s: any) => ({
        paper: String(s.paper || ""),
        subject: String(s.subject || ""),
        theoryMax: Number(s.theoryMax || 0),
        theoryMin: Number(s.theoryMin || 0),
        practicalMax: Number(s.practicalMax || 0),
        practicalMin: Number(s.practicalMin || 0),
        total: Number(s.total || 0),
        grade: String(s.grade || ""),
      })) : [],
      isSentToStudent: !!isSentToStudent,
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json({ success: false, error: "Certificate number already exists" }, { status: 409 });
    }
    console.error("[POST certificates]", err);
    return NextResponse.json({ success: false, error: "Failed to create certificate" }, { status: 500 });
  }
}

