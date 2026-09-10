export const revalidate = 30;
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MockTest from "@/models/MockTest";
import { getCache, setCache } from "@/lib/cache";

function serializeQuestion(q: any, stripAnswers = false) {
  const base: any = {
    id:             String(q._id),
    questionText:   q.questionText   ?? "",
    questionTextHi: q.questionTextHi ?? "",
    options:        q.options        ?? [],
    optionsHi:      q.optionsHi      ?? [],
    marks:          q.marks,
  };
  if (!stripAnswers) {
    base.correctOption = q.correctOption;
    base.explanation   = q.explanation   ?? "";
    base.explanationHi = q.explanationHi ?? "";
  }
  return base;
}

function serialize(doc: any, stripAnswers = false) {
  return {
    id:             String(doc._id),
    title:          doc.title,
    description:    doc.description,
    subject:        doc.subject,
    courseCategory: doc.courseCategory ?? "General",
    isFree:         doc.isFree ?? true,
    duration:       doc.duration,
    totalMarks:     doc.totalMarks,
    passingMarks:   doc.passingMarks,
    status:         doc.status,
    attemptLimit:   doc.attemptLimit,
    questions: (doc.questions ?? []).map((q: any) => serializeQuestion(q, stripAnswers)),
  };
}

// ── GET list ──────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q          = searchParams.get("search")?.trim() || "";
    const status     = searchParams.get("status") || "";
    const publicOnly = searchParams.get("public") === "1";
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip  = (page - 1) * limit;
    const catParam = searchParams.get("category") || "";
    const freeParam = searchParams.get("free") || "";
    const cacheKey = `mock-tests:${q}:${status}:${publicOnly}:${catParam}:${freeParam}:${page}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });

    await connectDB();

    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter["$or"] = [{ title: regex }, { subject: regex }, { description: regex }];
    }
    if (status && status !== "all") filter.status = status;
    if (publicOnly) filter.status = "active";
    if (catParam && catParam !== "all") filter.courseCategory = catParam;
    if (freeParam === "1") filter.isFree = true;

    const [items, total] = await Promise.all([
      MockTest.find(filter).select("title description subject courseCategory isFree duration totalMarks status").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MockTest.countDocuments(filter),
    ]);

    const data = items.map((doc) => serialize(doc, publicOnly));

    const payload = {
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
    setCache(cacheKey, payload, 30_000);
    return NextResponse.json(payload, { headers: { "X-Cache": "MISS", "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  } catch (err) {
    console.error("[GET mock-tests]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mock tests" },
      { status: 500 }
    );
  }
}

// ── POST create ───────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, subject, duration, totalMarks, passingMarks, status, attemptLimit } = body;

    if (!title?.trim() || !description?.trim() || !subject?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title, description and subject are required" },
        { status: 400 }
      );
    }

    const doc = await MockTest.create({
      title:        title.trim(),
      description:  description.trim(),
      subject:      subject.trim(),
      duration:     Number(duration)     || 30,
      totalMarks:   Number(totalMarks)   || 10,
      passingMarks: Number(passingMarks) || 5,
      status:       status || "active",
      attemptLimit: Number(attemptLimit) || 10,
      questions:    [],
    });

    return NextResponse.json({ success: true, data: serialize(doc) }, { status: 201 });
  } catch (err) {
    console.error("[POST mock-tests]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create mock test" },
      { status: 500 }
    );
  }
}
