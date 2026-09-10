export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Helper to generate RCC-ENR-YYYY-XXXX
async function generateEnrollmentId() {
  const year = new Date().getFullYear();
  const prefix = `RCC-ENR-${year}-`;
  const last = await Enrollment.findOne({ enrollmentId: { $regex: `^${prefix}` } }).sort({ enrollmentId: -1 }).select("enrollmentId");
  let num = 1;
  if (last?.enrollmentId) {
    const lastNum = parseInt(last.enrollmentId.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) num = lastNum + 1;
  }
  return `${prefix}${String(num).padStart(4, "0")}`;
}

// POST /api/enrollments — public (student or outsider)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { courseId, fullName, email, phone, fatherName, address, education, amount, utr, proofUrl, paymentDate } = body;

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });

    // Detect if logged-in student (before duplicate check)
    let applicantType: "student" | "outsider" = "outsider";
    let studentId: any = undefined;
    try {
      const token = cookies().get("student_token")?.value;
      if (token) {
        const payload: any = verifyToken(token);
        if (payload?.id) {
          applicantType = "student";
          studentId = payload.id;
        }
      }
    } catch {}

    const feeNum = parseInt(String(course.fees).replace(/[^0-9]/g, "") || "0");
    const isFree = !isNaN(feeNum) && feeNum === 0;

    // For free courses, amount/utr/proof are not required — auto-approve
    // For paid courses, validate payment proof
    let cleanUtr = String(utr || "").trim().replace(/\s/g, "");
    let cleanProof = String(proofUrl || "").trim();

    if (isFree) {
      if (!courseId || !fullName || !email || !phone) {
        return NextResponse.json({ success: false, error: "Name, email, phone required" }, { status: 400 });
      }
      if (!cleanUtr || cleanUtr.startsWith("FREE")) cleanUtr = `FREE-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
      if (!cleanProof || cleanProof === "FREE") cleanProof = "FREE";
    } else {
      if (!courseId || !fullName || !email || !phone || !amount || !utr || !proofUrl) {
        return NextResponse.json({ success: false, error: "All required fields missing (course, name, email, phone, amount, UTR, proof)" }, { status: 400 });
      }
      if (cleanUtr.length < 8) return NextResponse.json({ success: false, error: "UTR / Transaction ID must be at least 8 characters" }, { status: 400 });
      const dup = await Enrollment.findOne({ utr: cleanUtr });
      if (dup) return NextResponse.json({ success: false, error: "This UTR / Transaction ID already submitted" }, { status: 409 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });

    // Prevent duplicate enrollment for same course + same user
    const dupEnroll = await Enrollment.findOne({
      courseId: course._id,
      $or: [
        { email: cleanEmail },
        ...(studentId ? [{ studentId }] : []),
      ],
      status: { $in: ["pending_verification", "approved"] },
    });
    if (dupEnroll) {
      return NextResponse.json({ success: false, error: dupEnroll.status === "approved" ? "Already enrolled in this course" : "Enrollment already pending for this course" }, { status: 409 });
    }

    // If applicant claims to be student but not logged in, still outsider - ok

    const enrollmentId = await generateEnrollmentId();

    // Compute expiry — per enrollment
    const accessDays = (course as any).accessDays || 0;
    const now = new Date();
    let enrolledAt: Date | undefined = undefined;
    let expiresAt: Date | null = null;
    if (accessDays > 0) {
      if (isFree) {
        enrolledAt = now;
        expiresAt = new Date(now.getTime() + accessDays * 24 * 60 * 60 * 1000);
      } else {
        // For paid, enrolledAt/expiresAt will be set on approve, not now
        enrolledAt = undefined;
        expiresAt = null;
      }
    }

    const doc = await Enrollment.create({
      enrollmentId,
      courseId: course._id,
      courseName: course.name,
      courseFees: course.fees,
      applicantType,
      studentId,
      fullName: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      fatherName: fatherName ? String(fatherName).trim() : "",
      address: address ? String(address).trim() : "",
      education: education ? String(education).trim() : "",
      amount: isFree ? "0" : String(amount).trim(),
      utr: cleanUtr,
      proofUrl: cleanProof,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: isFree ? "approved" : "pending_verification",
      verifiedAt: isFree ? now : undefined,
      enrolledAt: enrolledAt as any,
      expiresAt: expiresAt as any,
    } as any);

    return NextResponse.json({ success: true, data: { id: String((doc as any)._id), enrollmentId: (doc as any).enrollmentId, status: (doc as any).status } });
  } catch (e: any) {
    console.error("[enrollments POST]", e);
    if (e?.code === 11000) {
      return NextResponse.json({ success: false, error: "Duplicate UTR — already submitted" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// GET /api/enrollments — admin/staff only (list with filter)
export async function GET(req: Request) {
  try {
    await connectDB();
    // auth check — must be admin or staff
    const token = cookies().get("rama_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload: any = verifyToken(token);
    if (!payload || !["admin", "staff"].includes(payload.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q: any = {};
    if (status && ["pending_verification", "approved", "rejected"].includes(status)) q.status = status;

    const list = await Enrollment.find(q).sort({ createdAt: -1 }).lean();
    const data = list.map((d: any) => ({ ...d, id: String(d._id), _id: String(d._id) }));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("[enrollments GET]", e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
