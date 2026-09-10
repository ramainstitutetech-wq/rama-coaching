export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import CourseLesson from "@/models/CourseLesson";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// GET /api/courses/[id]/lessons?admin=1 — if admin, show drafts too, else only published + enrolled check
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const adminView = searchParams.get("admin") === "1";

    if (adminView) {
      const token = cookies().get("rama_token")?.value;
      if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
      const payload: any = verifyToken(token);
      if (!payload || !["admin", "staff"].includes(payload.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      const lessons = await CourseLesson.find({ courseId: course._id }).sort({ order: 1, createdAt: 1 }).lean();
      return NextResponse.json({ success: true, data: lessons.map((l: any) => ({ ...l, id: String(l._id) })) });
    }

    // Student view — only published, but allow public to preview? Enforce enrolled check optionally
    // For now allow any logged-in student if enrolled or course is free; otherwise only published but we still return to show preview
    const lessons = await CourseLesson.find({ courseId: course._id, status: "published" }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, data: lessons.map((l: any) => ({ ...l, id: String(l._id) })) });
  } catch (e) {
    console.error("[lessons GET]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/courses/[id]/lessons — admin only
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload || !["admin", "staff"].includes(payload.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const course = await Course.findById(params.id);
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

    const body = await req.json();
    const { title, type, fileUrl, content, thumbnailUrl, duration, order, status } = body;
    if (!title || !type) return NextResponse.json({ success: false, error: "title and type required" }, { status: 400 });
    if (!["video_youtube", "video_drive", "pdf", "ppt", "text", "image"].includes(type)) return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    if (type !== "text" && !fileUrl && !content) return NextResponse.json({ success: false, error: "fileUrl required for this type" }, { status: 400 });
    if (type === "text" && !content) return NextResponse.json({ success: false, error: "content required for text" }, { status: 400 });

    const doc = await CourseLesson.create({
      courseId: course._id,
      title: String(title).trim(),
      type,
      fileUrl: fileUrl ? String(fileUrl).trim() : "",
      content: content ? String(content) : "",
      thumbnailUrl: thumbnailUrl ? String(thumbnailUrl).trim() : "",
      duration: duration ? String(duration).trim() : "",
      order: typeof order === "number" ? order : (await CourseLesson.countDocuments({ courseId: course._id })) + 1,
      status: status === "draft" ? "draft" : "published",
    });

    return NextResponse.json({ success: true, data: { id: String(doc._id) } });
  } catch (e) {
    console.error("[lessons POST]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
