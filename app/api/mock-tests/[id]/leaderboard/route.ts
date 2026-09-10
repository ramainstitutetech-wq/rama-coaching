export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MockTestAttempt from "@/models/MockTestAttempt";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const attempts = await MockTestAttempt.find({ mockTestId: params.id })
      .sort({ percentage: -1, score: -1, createdAt: 1 })
      .limit(limit)
      .lean();

    const totalAttempted = await MockTestAttempt.countDocuments({ mockTestId: params.id });

    const leaderboard = attempts.map((a: any, idx: number) => {
      const d = new Date(a.createdAt);
      const dateStr = d.toLocaleDateString("en-CA"); // YYYY/MM/DD
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      return {
        rank: idx + 1,
        name: a.studentName,
        rollNumber: a.rollNumber || "",
        isRamaStudent: !!a.isRamaStudent,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        grade: a.grade,
        date: dateStr,
        time: timeStr,
        dateTime: `${dateStr} ${timeStr}`,
        createdAt: a.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      totalAttempted,
      leaderboard,
    });
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
