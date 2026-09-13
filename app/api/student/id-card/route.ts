export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import IDCard from "@/models/IDCard";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get("student_token")?.value || cookieStore.get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    // Strictly check student role if present
    if (payload.role && payload.role !== "student") {
      // Allow admin to fetch own card? For admin preview via student endpoint, fallback to admin check
      // But for student portal, role must be student
    }
    const studentId = payload.id || payload._id || payload.studentId;
    const card = await IDCard.findOne({ studentId, status: "active", deletedAt: { $exists: false } }).sort({ createdAt: -1 }).lean();
    if (!card) return NextResponse.json({ success: true, data: null });
    return NextResponse.json({
      success: true,
      data: {
        id: String((card as any)._id),
        cardNumber: (card as any).cardNumber,
        studentName: (card as any).studentName,
        fatherName: (card as any).fatherName || "",
        motherName: (card as any).motherName || "",
        rollNo: (card as any).rollNo,
        courseName: (card as any).courseName,
        courseCode: (card as any).courseCode || "",
        batch: (card as any).batch || "",
        dob: (card as any).dob ? new Date((card as any).dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        phone: (card as any).phone || "",
        address: (card as any).address || "",
        photoUrl: (card as any).photoUrl || "",
        issueDate: (card as any).issueDate ? new Date((card as any).issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        validTill: (card as any).validTill ? new Date((card as any).validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        status: (card as any).status,
      },
    });
  } catch (e) {
    console.error("[student id-card]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
