import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Certificate.findOne({ _id: params.id, deletedAt: { $exists: false } }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[GET cert]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const allowed = ["certificateNumber", "studentName", "rollNo", "courseName", "courseCode", "fatherName", "motherName", "completionDate", "trainingCenter", "centerCode", "performance", "courseDuration", "photoUrl", "documentType", "type", "dated", "place", "subjects", "status", "issueDate", "slNo", "enrollmentNo", "isSentToStudent"];
    const update: any = {};
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    if (update.completionDate) update.completionDate = new Date(update.completionDate as string);
    if (update.issueDate) update.issueDate = new Date(update.issueDate as string);
    if (update.subjects && Array.isArray(update.subjects)) {
      update.subjects = (update.subjects as any[]).map((s) => ({
        paper: String(s.paper || ""), subject: String(s.subject || ""), theoryMax: Number(s.theoryMax || 0), theoryMin: Number(s.theoryMin || 0), practicalMax: Number(s.practicalMax || 0), practicalMin: Number(s.practicalMin || 0), total: Number(s.total || 0), grade: String(s.grade || ""),
      }));
    }
    const doc = await Certificate.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, update, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    console.error("[PUT cert]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Certificate.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, { deletedAt: new Date() }, { new: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE cert]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
