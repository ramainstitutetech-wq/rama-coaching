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

    // Try to send activation email if tempPassword exists — non-blocking with timeout
    const plainPassword = student.tempPassword;
    if (plainPassword) {
      try {
        // 7s timeout via email lib; also race with extra safety timeout
        const emailPromise = sendActivationEmail({
          to: student.email,
          name: student.fullName,
          email: student.email,
          password: plainPassword,
        });
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Email timeout after 8s")), 8000));
        await Promise.race([emailPromise, timeoutPromise]);
        // Clear temp password after successful send
        student.tempPassword = undefined;
        await student.save();
      } catch (e: any) {
        console.error("[activate email failed]", e);
        // Activation already done (status=active saved above) — don't revert, just inform admin
        // Keep tempPassword so admin can retry sending later if needed
        return NextResponse.json({ success: true, message: "Activated! Email not sent: " + (e.message || "Brevo timeout — check BREVO_API_KEY / network").slice(0,120), data: { id: String(student._id), status: student.status } });
      }
    }

    return NextResponse.json({ success: true, message: "Student activated and email sent", data: { id: String(student._id), status: student.status } });
  } catch (e) {
    console.error("[activate]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
