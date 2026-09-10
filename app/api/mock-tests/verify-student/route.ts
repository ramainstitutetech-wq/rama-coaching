export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const rollNumber = String(body.rollNumber || "").trim();
    if (!rollNumber) {
      return NextResponse.json({ success: false, error: "Roll number is required" }, { status: 400 });
    }
    const student = await Student.findOne({
      rollNumber: rollNumber,
      deletedAt: { $exists: false },
    }).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, verified: false, error: "Student record not found. Please check your roll number." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Student Verified Successfully",
      student: {
        rollNumber: (student as any).rollNumber,
        fullName: (student as any).fullName,
        courseName: (student as any).courseName,
        status: (student as any).status,
      },
    });
  } catch (err) {
    console.error("[verify-student]", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
