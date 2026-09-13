export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import IDCard from "@/models/IDCard";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;
    // Try by _id first, then cardNumber
    let doc: any = null;
    try { doc = await IDCard.findById(id).lean(); } catch {}
    if (!doc) doc = await IDCard.findOne({ cardNumber: id }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "ID Card not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        id: String(doc._id),
        cardNumber: doc.cardNumber,
        studentName: doc.studentName,
        fatherName: doc.fatherName || "",
        motherName: doc.motherName || "",
        rollNo: doc.rollNo,
        courseName: doc.courseName,
        courseCode: doc.courseCode || "",
        batch: doc.batch || "",
        dob: doc.dob ? new Date(doc.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        phone: doc.phone || "",
        address: doc.address || "",
        photoUrl: doc.photoUrl || "",
        issueDate: doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        validTill: doc.validTill ? new Date(doc.validTill).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
        status: doc.status,
      },
    });
  } catch (e) {
    console.error("[GET id-card by id]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    let doc: any = null;
    try { doc = await IDCard.findByIdAndUpdate(params.id, { deletedAt: new Date() }, { new: true }); } catch {}
    if (!doc) doc = await IDCard.findOneAndUpdate({ cardNumber: params.id }, { deletedAt: new Date() }, { new: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error("[DELETE id-card]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
