export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;
    const filter: any = { deletedAt: { $exists: false } };
    if (q) { const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); filter["$or"] = [{ studentName: r }, { course: r }, { review: r }]; }
    const [items, total] = await Promise.all([Testimonial.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(), Testimonial.countDocuments(filter)]);
    const data = items.map((x: any) => ({ id: String(x["_id"]), studentName: x["studentName"], course: x["course"], review: x["review"], rating: x["rating"], published: x["published"], avatarColor: x["avatarColor"] }));
    return NextResponse.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) { console.error(e); return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}
export async function POST(req: Request) {
  try {
    await connectDB();
    const b = await req.json();
    if (!b.studentName?.trim() || !b.review?.trim()) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    const doc = await Testimonial.create({ studentName: b.studentName.trim(), course: b.course?.trim() || "General", review: b.review.trim(), rating: Number(b.rating) || 5, published: b.published ?? true, avatarColor: b.avatarColor || "#1F3354" });
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ success: false, error: "Failed" }, { status: 500 }); }
}

