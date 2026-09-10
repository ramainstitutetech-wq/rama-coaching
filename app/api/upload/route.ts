export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate type — allow image + pdf + ppt for course content
    const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const allowedDocs = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
    const isImage = allowedImages.includes(file.type) || file.type.startsWith("image/");
    const isDoc = allowedDocs.includes(file.type);
    if (!isImage && !isDoc) {
      return NextResponse.json({ success: false, error: "Only images, PDF, PPT allowed" }, { status: 400 });
    }
    const maxSize = isDoc ? 20 * 1024 * 1024 : 2 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json({ success: false, error: isDoc ? "Max 20MB for PDF/PPT" : "Max 2MB" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, name);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, data: { url: `/uploads/${name}` } });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
