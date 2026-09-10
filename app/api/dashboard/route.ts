import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Certificate from "@/models/Certificate";
import Course from "@/models/Course";
import FranchiseApplication from "@/models/FranchiseApplication";
import ContactMessage from "@/models/ContactMessage";

export async function GET() {
  try {
    await connectDB();
    const [totalStudents, issuedCertificates, activeCourses, pendingFranchise, newMessages, recentCertificates, recentStudents, recentApplications] = await Promise.all([
      Student.countDocuments({ deletedAt: { $exists: false } }),
      Certificate.countDocuments({ status: "issued", deletedAt: { $exists: false } }),
      Course.countDocuments({ status: "active", deletedAt: { $exists: false } }),
      FranchiseApplication.countDocuments({ status: "pending", deletedAt: { $exists: false } }),
      ContactMessage.countDocuments({ status: "unread", deletedAt: { $exists: false } }),
      Certificate.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(5).lean(),
      Student.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(5).lean(),
      FranchiseApplication.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        issuedCertificates,
        activeCourses,
        pendingFranchise,
        newMessages,
        recentCertificates: (recentCertificates as any[]).map((c) => ({
          id: String(c["_id"]),
          certificateNumber: c["certificateNumber"],
          studentName: c["studentName"],
          course: c["courseName"],
          status: c["status"],
          rollNumber: c["rollNo"],
        })),
        recentStudents: (recentStudents as any[]).map((s) => ({
          id: String(s["_id"]),
          fullName: s["fullName"],
          rollNumber: s["rollNumber"],
          course: s["courseName"],
          batch: s["batch"],
          avatarColor: s["avatarColor"],
        })),
        recentApplications: (recentApplications as any[]).map((f) => ({
          id: String(f["_id"]),
          name: f["name"],
          city: f["city"],
          date: f["date"] ? new Date(f["date"] as string).toISOString().slice(0,10) : "",
          status: f["status"],
        })),
      },
    });
  } catch (e) {
    console.error("[dashboard]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

