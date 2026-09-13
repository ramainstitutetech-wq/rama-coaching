export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import IDCard from "@/models/IDCard";

export async function GET(_req: Request, { params }: { params: { cardNumber: string } }) {
  try {
    await connectDB();
    const doc = await IDCard.findOne({
      cardNumber: params.cardNumber,
      deletedAt: { $exists: false },
    }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, valid: false, error: "ID card not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        cardNumber: doc.cardNumber,
        studentName: doc.studentName,
        fatherName: doc.fatherName || "",
        rollNo: doc.rollNo,
        courseName: doc.courseName,
        batch: doc.batch || "",
        dob: doc.dob ? new Date(doc.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        phone: doc.phone || "",
        address: doc.address || "",
        status: doc.status,
        issueDate: doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        validTill: doc.validTill ? new Date(doc.validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      },
    });
  } catch (e) {
    console.error("[Verify ID card]", e);
    return NextResponse.json({ success: false, valid: false, error: "Verification failed" }, { status: 500 });
  }
}
