export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate type — allow images + documents (PDF, PPT, DOCX)
    const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/svg+xml"];
    const allowedDocs = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isImage = allowedImages.includes(file.type) || file.type.startsWith("image/");
    const isDoc = allowedDocs.includes(file.type) || file.name.endsWith(".pdf") || file.name.endsWith(".ppt") || file.name.endsWith(".pptx");

    if (!isImage && !isDoc) {
      return NextResponse.json(
        { success: false, error: "Only images (JPG, PNG, WEBP) and documents (PDF, PPT) are allowed" },
        { status: 400 }
      );
    }

    const maxSize = isDoc ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { success: false, error: isDoc ? "Max 25MB for PDF/Documents" : "Max 10MB for Images" },
        { status: 400 }
      );
    }

    // 1. Upload to Cloudinary with auto-compression & WebP conversion
    try {
      const folder = isDoc ? "rama_coaching/documents" : "rama_coaching/images";
      const result = await uploadToCloudinary(buffer, {
        folder,
        isDocument: isDoc,
        originalFilename: file.name,
      });

      return NextResponse.json({
        success: true,
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        },
      });
    } catch (cloudErr) {
      console.warn("[upload] Cloudinary upload warning, falling back to local storage:", cloudErr);

      // 2. Safe local fallback if cloud is temporarily unreachable
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });

      const ext = path.extname(file.name) || (isDoc ? ".pdf" : ".jpg");
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, name);
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        data: { url: `/uploads/${name}` },
      });
    }
  } catch (e: any) {
    console.error("[upload] Error:", e);
    return NextResponse.json(
      { success: false, error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
