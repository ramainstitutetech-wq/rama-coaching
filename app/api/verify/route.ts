export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const certificateNumber = searchParams.get("certificateNumber")?.trim() || searchParams.get("certificateNo")?.trim() || "";
    const rollNumber = searchParams.get("rollNumber")?.trim() || searchParams.get("rollNo")?.trim() || "";
    if (!certificateNumber && !rollNumber) {
      return NextResponse.json({ success: false, error: "Certificate number or roll number required" }, { status: 400 });
    }
    let cert: any | null = null;
    if (certificateNumber) {
      cert = await Certificate.findOne({ certificateNumber: certificateNumber, deletedAt: { $exists: false } }).lean() as any | null;
    }
    if (!cert && rollNumber) {
      cert = await Certificate.findOne({ rollNo: rollNumber, deletedAt: { $exists: false } }).lean() as any | null;
    }
    if (!cert) {
      return NextResponse.json({ success: false, error: "Certificate not found", found: false }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      found: true,
      data: {
        certificateNumber: cert["certificateNumber"],
        rollNumber: cert["rollNo"],
        studentName: cert["studentName"],
        fatherName: cert["fatherName"],
        course: cert["courseName"],
        courseName: cert["courseName"],
        courseCode: cert["courseCode"],
        issueDate: cert["issueDate"] ? new Date(cert["issueDate"] as string).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "",
        completionDate: cert["completionDate"] ? new Date(cert["completionDate"] as string).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "",
        trainingCenter: cert["trainingCenter"],
        status: cert["status"],
        documentType: cert["documentType"],
        grade: (cert["performance"] as string) || (Array.isArray(cert["subjects"]) && (cert["subjects"] as any[])[0]?.["grade"] as string) || "A",
      },
    });
  } catch (e) {
    console.error("[verify]", e);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}

