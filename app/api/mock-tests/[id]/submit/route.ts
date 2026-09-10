export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MockTest from "@/models/MockTest";
import MockTestAttempt, { getGradeForPercentage } from "@/models/MockTestAttempt";

// POST /api/mock-tests/[id]/submit
// Body: { answers: { [questionId]: number } }  (selectedOption index 0-3)
// Returns: score, totalMarks, passingMarks, passed, breakdown[]
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await MockTest.findOne({ _id: params.id, deletedAt: { $exists: false }, status: "active" }).lean();
    if (!doc) return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });

    const body = await req.json();
    const answers: Record<string, number> = body.answers ?? {};
    const studentName = String(body.studentName || "").trim();
    const isRamaStudent = !!body.isRamaStudent;
    const rollNumber = String(body.rollNumber || "").trim();

    if (!studentName) {
      return NextResponse.json({ success: false, error: "Student name is required" }, { status: 400 });
    }

    let score = 0;
    const breakdown = (doc as any).questions.map((q: any) => {
      const qid      = String(q._id);
      const selected = answers[qid] ?? -1; // -1 = skipped
      const correct  = q.correctOption;
      const isCorrect = selected === correct;
      if (isCorrect) score += q.marks;
      return {
        questionId:     qid,
        questionText:   q.questionText   ?? "",
        questionTextHi: q.questionTextHi ?? "",
        options:        q.options        ?? [],
        optionsHi:      q.optionsHi      ?? [],
        selectedOption: selected,
        correctOption:  correct,
        explanation:    q.explanation    ?? "",
        explanationHi:  q.explanationHi  ?? "",
        isCorrect,
        marks:          q.marks,
        marksEarned:    isCorrect ? q.marks : 0,
      };
    });

    const totalMarks = (doc as any).totalMarks;
    const passingMarks = (doc as any).passingMarks;
    const passed = score >= passingMarks;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const grade = getGradeForPercentage(percentage);

    // Save attempt for real leaderboard
    try {
      await MockTestAttempt.create({
        mockTestId: (doc as any)._id,
        mockTestTitle: (doc as any).title,
        studentName,
        rollNumber: isRamaStudent ? rollNumber : "",
        isRamaStudent,
        score,
        totalMarks,
        percentage,
        grade,
        totalQuestions: (doc as any).questions.length,
        attempted: Object.keys(answers).length,
        correct: breakdown.filter((b: any) => b.isCorrect).length,
        passed,
      });
    } catch (e) {
      console.error("[save attempt]", e);
      // do not block result even if attempt save fails
    }

    return NextResponse.json({
      success: true,
      result: {
        score,
        totalMarks,
        passingMarks,
        totalQuestions: (doc as any).questions.length,
        attempted: Object.keys(answers).length,
        correct: breakdown.filter((b: any) => b.isCorrect).length,
        passed,
        percentage,
        grade,
        breakdown,
      },
    });
  } catch (err) {
    console.error("[POST mock-test submit]", err);
    return NextResponse.json({ success: false, error: "Failed to evaluate test" }, { status: 500 });
  }
}
