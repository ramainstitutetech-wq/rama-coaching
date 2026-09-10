export const revalidate = 30;
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ENote from "@/models/ENote";
import { getCache, setCache } from "@/lib/cache";

function serialize(doc: any) {
  return {
    id:             String(doc._id),
    title:          doc.title,
    description:    doc.description,
    courseCategory: doc.courseCategory,
    accessType:     doc.accessType,
    imageUrl:       doc.imageUrl ?? "",
    fileUrl:        doc.fileUrl  ?? "",
    content:        doc.content  ?? "",
    order:          doc.order    ?? 0,
    status:         doc.status,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const access   = searchParams.get("access")   || "";
    const status   = searchParams.get("status")   || "";
    const publicOnly = searchParams.get("public") === "1" ? "1" : "";
    const cacheKey = `enotes:${category}:${access}:${status}:${publicOnly}`;
    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });

    await connectDB();

    const filter: any = { deletedAt: { $exists: false } };
    if (publicOnly) filter.status = "active";
    else if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.courseCategory = category;
    if (access && access !== "all") filter.accessType = access;

    const docs = await ENote.find(filter)
      .select("title description courseCategory accessType fileUrl content order status")
      .sort({ courseCategory: 1, order: 1, createdAt: -1 })
      .lean();

    const payload = { success: true, data: docs.map(serialize) };
    setCache(cacheKey, payload, 30_000);
    return NextResponse.json(payload, { headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("[GET enotes]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, courseCategory, accessType, fileUrl, content, order, status } = body;
    if (!title?.trim() || !description?.trim() || !courseCategory) {
      return NextResponse.json({ success: false, error: "Title, description and category required" }, { status: 400 });
    }
    const doc = await ENote.create({
      title: title.trim(), description: description.trim(),
      courseCategory, accessType: accessType || "enrolled",
      imageUrl: body.imageUrl?.trim() || "",
      fileUrl: fileUrl?.trim() || "", content: content?.trim() || "",
      order: Number(order) || 0, status: status || "active",
    });
    return NextResponse.json({ success: true, data: serialize(doc) }, { status: 201 });
  } catch (err) {
    console.error("[POST enotes]", err);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}
