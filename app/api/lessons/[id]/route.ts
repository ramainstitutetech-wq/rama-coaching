export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CourseLesson from "@/models/CourseLesson";

async function isAdmin() {
  const token = cookies().get("rama_token")?.value;
  if (!token) return false;
  const p: any = verifyToken(token);
  return p && ["admin", "staff"].includes(p.role);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!(await isAdmin())) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const doc = await CourseLesson.findById(params.id);
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const { title, type, fileUrl, content, thumbnailUrl, duration, order, status } = body;
    if (title !== undefined) doc.title = String(title).trim();
    if (type !== undefined) doc.type = type;
    if (fileUrl !== undefined) doc.fileUrl = String(fileUrl).trim();
    if (content !== undefined) doc.content = String(content);
    if (thumbnailUrl !== undefined) doc.thumbnailUrl = String(thumbnailUrl).trim();
    if (duration !== undefined) doc.duration = String(duration).trim();
    if (order !== undefined) doc.order = Number(order);
    if (status !== undefined) doc.status = status;
    await doc.save();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[lesson PUT]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    if (!(await isAdmin())) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const doc = await CourseLesson.findByIdAndDelete(params.id);
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
