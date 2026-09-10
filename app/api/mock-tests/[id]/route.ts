import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MockTest from "@/models/MockTest";

function serializeQuestion(q: any) {
  return {
    id:             String(q._id),
    questionText:   q.questionText   ?? "",
    questionTextHi: q.questionTextHi ?? "",
    options:        q.options        ?? [],
    optionsHi:      q.optionsHi      ?? [],
    correctOption:  q.correctOption,
    explanation:    q.explanation    ?? "",
    explanationHi:  q.explanationHi  ?? "",
    marks:          q.marks,
  };
}

function serialize(doc: any) {
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
    questions: (doc.questions ?? []).map(serializeQuestion),
  };
}

// ── GET single (admin — full data including answers) ──────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doc = await MockTest.findOne({
      _id: params.id,
      deletedAt: { $exists: false },
    }).lean();
    if (!doc)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("[GET mock-test]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

// ── PUT — update meta + questions (with Hindi fields) ─────────────────────────
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body   = await req.json();
    const update: any = {};

    // Top-level string fields
    for (const k of ["title", "description", "subject", "status", "courseCategory"]) {
      if (body[k] !== undefined)
        update[k] = typeof body[k] === "string" ? body[k].trim() : body[k];
    }
    // Top-level numeric fields
    for (const k of ["duration", "totalMarks", "passingMarks", "attemptLimit"]) {
      if (body[k] !== undefined) update[k] = Number(body[k]);
    }
    if (body.isFree !== undefined) update.isFree = Boolean(body.isFree);

    // Questions array — validate then persist with ALL bilingual fields
    if (Array.isArray(body.questions)) {
      for (const q of body.questions) {
        if (!q.questionText?.trim())
          return NextResponse.json(
            { success: false, error: "Each question must have questionText" },
            { status: 400 }
          );
        if (!Array.isArray(q.options) || q.options.length !== 4)
          return NextResponse.json(
            { success: false, error: "Each question must have exactly 4 options" },
            { status: 400 }
          );
        if (q.correctOption == null || q.correctOption < 0 || q.correctOption > 3)
          return NextResponse.json(
            { success: false, error: "correctOption must be 0–3" },
            { status: 400 }
          );
      }

      update.questions = body.questions.map((q: any) => {
        const mapped: any = {
          questionText:   q.questionText.trim(),
          questionTextHi: q.questionTextHi?.trim() ?? "",
          options:        q.options.map((o: string) => o?.trim() ?? ""),
          optionsHi: Array.isArray(q.optionsHi)
            ? q.optionsHi.map((o: string) => o?.trim() ?? "")
            : [],
          correctOption:  Number(q.correctOption),
          explanation:    q.explanation?.trim()   ?? "",
          explanationHi:  q.explanationHi?.trim() ?? "",
          marks:          Number(q.marks) || 1,
        };
        // Preserve existing _id if editing existing question
        if (q.id) mapped._id = q.id;
        return mapped;
      });
    }

    const doc = await MockTest.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } },
      update,
      { new: true, runValidators: true }
    );
    if (!doc)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, data: serialize(doc) });
  } catch (err) {
    console.error("[PUT mock-test]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}

// ── DELETE — soft delete ──────────────────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const doc = await MockTest.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE mock-test]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
