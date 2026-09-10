export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import { sendActivationEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload || !["admin", "staff"].includes(payload.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const student: any = await Student.findById(params.id).select("+tempPassword +passwordHash");
    if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });

    // Update status to active if not already
    student.status = "active";
    await student.save();

    // Try to send activation email if tempPassword exists
    const plainPassword = student.tempPassword;
    if (plainPassword) {
      try {
        await sendActivationEmail({
          to: student.email,
          name: student.fullName,
          email: student.email,
          password: plainPassword,
        });
        // Clear temp password after successful send
        student.tempPassword = undefined;
        await student.save();
      } catch (e: any) {
        console.error("[activate email failed]", e);
        // Don't fail the activation, just log
        return NextResponse.json({ success: true, message: "Activated but email failed: " + (e.message || "unknown"), data: { id: String(student._id), status: student.status } });
      }
    }

    return NextResponse.json({ success: true, message: "Student activated and email sent", data: { id: String(student._id), status: student.status } });
  } catch (e) {
    console.error("[activate]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
