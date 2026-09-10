import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ENote from "@/models/ENote";

function serialize(doc: any) {
  return {
    id: String(doc._id), title: doc.title, description: doc.description,
    courseCategory: doc.courseCategory, accessType: doc.accessType,
    imageUrl: doc.imageUrl ?? "",
    fileUrl: doc.fileUrl ?? "", content: doc.content ?? "",
    order: doc.order ?? 0, status: doc.status,
  };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await ENote.findOne({ _id: params.id, deletedAt: { $exists: false } }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("[GET enote]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const update: any = {};
    for (const k of ["title", "description", "courseCategory", "accessType", "imageUrl", "fileUrl", "content", "status"]) {
      if (body[k] !== undefined) update[k] = typeof body[k] === "string" ? body[k].trim() : body[k];
    }
    if (body.order !== undefined) update.order = Number(body.order);
    const doc = await ENote.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } }, update, { new: true, runValidators: true }
    );
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("[PUT enote]", err);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await ENote.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } }, { deletedAt: new Date() }, { new: true }
    );
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE enote]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
