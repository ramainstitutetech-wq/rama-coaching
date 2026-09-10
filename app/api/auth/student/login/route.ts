export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password, rollNumber } = await req.json();
    const identifier = (email || rollNumber || "").trim().toLowerCase();
    if (!identifier || !password) return NextResponse.json({ success: false, error: "Email/Roll and password required" }, { status: 400 });

    // Try by email or rollNumber
    const student = await Student.findOne({
      $or: [{ email: identifier }, { rollNumber: identifier }, { email: identifier.toLowerCase() }],
      deletedAt: { $exists: false },
    }).select("+passwordHash") as any;

    if (!student || !student.passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid credentials or password not set by admin" }, { status: 401 });
    }
    if (student.status === "inactive") return NextResponse.json({ success: false, error: "Account deactivated" }, { status: 403 });

    const ok = await comparePassword(String(password), student.passwordHash);
    if (!ok) return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: String(student._id), email: student.email, role: "student", name: student.fullName } as any);

    const res = NextResponse.json({ success: true, data: { id: String(student._id), name: student.fullName, email: student.email, rollNumber: student.rollNumber, role: "student" } });
    res.cookies.set("student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[student login]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
