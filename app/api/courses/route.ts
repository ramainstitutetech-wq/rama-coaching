export const revalidate = 30;
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { getCache, setCache } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const cacheKey = `courses:${q}:${status}:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });

    await connectDB();

    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter["$or"] = [{ name: regex }, { description: regex }, { category: regex }];
    }
    if (status && status !== "all") filter["status"] = status;

    const [items, total] = await Promise.all([
      Course.find(filter).select("name description duration fees category accent imageUrl status durationValue durationUnit accessValue accessUnit accessDays createdAt").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Course.countDocuments(filter),
    ]);

    const data = items.map((c: any) => ({
      id: String(c["_id"]),
      name: c["name"],
      description: c["description"],
      duration: c["duration"],
      fees: c["fees"],
      category: c["category"],
      accent: c["accent"],
      imageUrl: c["imageUrl"] ?? "",
      status: c["status"],
      durationValue: c["durationValue"] ?? null,
      durationUnit: c["durationUnit"] ?? null,
      accessValue: c["accessValue"] ?? 0,
      accessUnit: c["accessUnit"] ?? "month",
      accessDays: c["accessDays"] ?? 0,
    }));

    const payload = { success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    setCache(cacheKey, payload, 30_000);
    return NextResponse.json(payload, { headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("[GET courses]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 });
  }
}

function calcDays(value: number, unit: string) {
  if (!value || value <= 0) return 0;
  const u = (unit || "month").toLowerCase();
  if (u === "week") return value * 7;
  if (u === "year") return value * 365;
  return value * 30; // month
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description, duration, fees, category, accent, status } = body;
    if (!name?.trim() || !description?.trim() || !duration?.trim() || !fees?.trim()) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    // Structured duration + expiry
    const durationValue = body.durationValue != null ? Number(body.durationValue) : null;
    const durationUnit = body.durationUnit || null;
    const accessValue = body.accessValue != null ? Number(body.accessValue) : 0;
    const accessUnit = body.accessUnit || "month";
    const accessDays = calcDays(accessValue, accessUnit);
    let finalDuration = duration.trim();
    if (durationValue != null && durationUnit) {
      const label = durationUnit === "week" ? (durationValue === 1 ? "Week" : "Weeks") : durationUnit === "year" ? (durationValue === 1 ? "Year" : "Years") : (durationValue === 1 ? "Month" : "Months");
      finalDuration = `${durationValue} ${label}`;
    }
    const doc = await Course.create({
      name: name.trim(),
      description: description.trim(),
      duration: finalDuration,
      fees: fees.trim(),
      category: category?.trim() || "General",
      accent: accent || "#1F3354",
      imageUrl: body.imageUrl?.trim() || "",
      status: status || "active",
      durationValue: durationValue as any,
      durationUnit: durationUnit as any,
      accessValue: accessValue as any,
      accessUnit: accessUnit as any,
      accessDays: accessDays as any,
    } as any);
    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json({ success: false, error: "Course name already exists" }, { status: 409 });
    }
    console.error("[POST courses]", err);
    return NextResponse.json({ success: false, error: "Failed to create course" }, { status: 500 });
  }
}

