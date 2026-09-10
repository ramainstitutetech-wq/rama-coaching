export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(req: Request) {
  try {
    const token = cookies().get("student_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || (payload as any).role !== "student") return NextResponse.json({ success: false, error: "Invalid" }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "";
    const filter: any = { studentId: (payload as any).id, deletedAt: { $exists: false } };
    if (type) filter.documentType = type;
    const items = await Certificate.find(filter).sort({ createdAt: -1 }).lean();
    const data = items.map((c: any) => ({
      id: String(c._id),
      certificateNumber: c.certificateNumber,
      courseName: c.courseName,
      courseCode: c.courseCode,
      type: c.documentType,
      documentType: c.documentType,
      issueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      status: c.status,
      isSentToStudent: c.isSentToStudent,
      createdAt: c.createdAt,
    }));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[student certs]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
