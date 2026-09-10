export const revalidate = 60;
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { getCache, setCache } from "@/lib/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const cacheKey = `course:${params.id}`;
    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });

    await connectDB();
    const doc = await Course.findOne({ _id: params.id, deletedAt: { $exists: false } }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    const payload = { success: true, data: { id: String((doc as any)["_id"]), ...(doc as any) } };
    setCache(cacheKey, payload, 60_000);
    return NextResponse.json(payload, { headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (err) {
    console.error("[GET course]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

function calcDaysUpd(value: number, unit: string) {
  if (!value || value <= 0) return 0;
  const u = (unit || "month").toLowerCase();
  if (u === "week") return value * 7;
  if (u === "year") return value * 365;
  return value * 30;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const update: any = {};
    for (const k of ["name", "description", "duration", "fees", "category", "accent", "status", "imageUrl"]) {
      if (body[k] !== undefined) update[k] = typeof body[k] === "string" ? body[k].trim() : body[k];
    }
    // Structured fields
    if (body.durationValue !== undefined) update.durationValue = body.durationValue != null ? Number(body.durationValue) : null;
    if (body.durationUnit !== undefined) update.durationUnit = body.durationUnit;
    if (body.accessValue !== undefined) {
      update.accessValue = Number(body.accessValue);
      const unit = body.accessUnit !== undefined ? body.accessUnit : (await Course.findById(params.id).then((c:any)=>c?.accessUnit) || "month");
      update.accessDays = calcDaysUpd(Number(body.accessValue), unit);
    }
    if (body.accessUnit !== undefined) {
      update.accessUnit = body.accessUnit;
      const val = body.accessValue !== undefined ? Number(body.accessValue) : (await Course.findById(params.id).then((c:any)=>c?.accessValue) || 0);
      update.accessDays = calcDaysUpd(val, body.accessUnit);
    }
    // If durationValue+Unit both provided, recompute duration string
    if (body.durationValue != null && body.durationUnit) {
      const v = Number(body.durationValue);
      const u = body.durationUnit;
      const label = u === "week" ? (v === 1 ? "Week" : "Weeks") : u === "year" ? (v === 1 ? "Year" : "Years") : (v === 1 ? "Month" : "Months");
      update.duration = `${v} ${label}`;
    }
    const doc = await Course.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, update, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate key")) return NextResponse.json({ success: false, error: "Course name exists" }, { status: 409 });
    console.error("[PUT course]", err);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Course.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, { deletedAt: new Date() }, { new: true });
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE course]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
