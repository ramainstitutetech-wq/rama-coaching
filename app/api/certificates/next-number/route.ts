export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

/**
 * GET /api/certificates/next-number
 * Scans ALL certificate records (excellence + marksheet, including soft-deleted
 * ones) for the highest trailing number in certificateNumber, then returns max + 1.
 * Soft-deleted records MUST be included: certificateNumber has a unique index, so a
 * deleted document still occupies its number — skipping it would return a
 * permanently colliding number that can never be saved.
 */
export async function GET() {
  try {
    await connectDB();

    // Pull only the certificateNumber field — no limit, no filter (deletedAt included)
    const all = await Certificate.find(
      {},
      { certificateNumber: 1, _id: 0 }
    ).lean();

    let max = 0;
    for (const doc of all) {
      const raw = (doc as any).certificateNumber as string | undefined;
      if (!raw) continue;
      const match = raw.match(/(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    }

    const next = `RCC-2026-${String(max + 1).padStart(4, "0")}`;
    return NextResponse.json({ success: true, next });
  } catch (err) {
    console.error("[GET next-number]", err);
    return NextResponse.json(
      { success: false, error: "Failed to compute next certificate number" },
      { status: 500 }
    );
  }
}
