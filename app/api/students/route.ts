export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Course from "@/models/Course";
import { hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search")?.trim() || "";
    const courseFilter = searchParams.get("course") || "";
    const statusFilter = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { deletedAt: { $exists: false } };
    // soft delete filter
    (filter as any)["deletedAt"] = { $exists: false };
    // Actually use $or for deletedAt null
    const query: any = { deletedAt: null };
    // Better: find where deletedAt doesn't exist or is null
    const mongoFilter: any = {};

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      (mongoFilter as any)["$or"] = [
        { fullName: regex },
        { email: regex },
        { rollNumber: regex },
        { phone: regex },
        { courseName: regex },
      ];
    }
    if (courseFilter) mongoFilter["courseName"] = courseFilter;
    if (statusFilter) mongoFilter["status"] = statusFilter;
    mongoFilter["deletedAt"] = { $exists: false };

    // Use $and to handle deletedAt correctly - we want docs without deletedAt
    const finalFilter: any = {
      ...mongoFilter,
    };
    // Override deletedAt to match docs without field: use { deletedAt: { $exists: false } }
    // So we need to set it explicitly
    finalFilter["deletedAt"] = { $exists: false };
    if (mongoFilter["$or"]) finalFilter["$or"] = mongoFilter["$or"] as unknown;

    const [items, total] = await Promise.all([
      Student.find(finalFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(finalFilter),
    ]);

    // Map to frontend shape
    const data = items.map((s: any) => ({
      id: String(s["_id"]),
      fullName: s["fullName"],
      rollNumber: s["rollNumber"],
      email: s["email"],
      phone: s["phone"],
      course: s["courseName"],
      courseId: String(s["courseId"] || ""),
      batch: s["batch"],
      admissionDate: s["admissionDate"] ? new Date(s["admissionDate"] as string).toISOString().slice(0, 10) : "",
      admissionDateDisplay: s["admissionDate"] ? new Date(s["admissionDate"] as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
      status: s["status"],
      avatarColor: s["avatarColor"],
      photoUrl: s["photoUrl"] || "",
      createdAt: s["createdAt"],
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET students]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, rollNumber, email, phone, course, courseFree, batch, admissionDate, status, avatarColor, photoUrl, password } = body;

    if (!fullName?.trim() || !rollNumber?.trim() || !email?.trim() || !phone?.trim() || !batch?.trim() || !admissionDate?.trim()) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (password && String(password).length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const courseName = course === "other" ? (courseFree?.trim() || "") : (course?.trim() || "");
    if (!courseName) return NextResponse.json({ success: false, error: "Course is required" }, { status: 400 });

    // Find or create course reference
    let courseDoc = await Course.findOne({ name: courseName });
    if (!courseDoc) {
      // Create a minimal course if not exists (so relation doesn't break)
      courseDoc = await Course.create({
        name: courseName,
        description: `${courseName} course`,
        duration: "6 Months",
        fees: "₹0",
        category: "General",
        status: "active",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }

    const createData: any = {
      fullName: fullName.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      courseId: courseDoc._id,
      courseName,
      courseFree: course === "other" ? courseFree?.trim() : "",
      batch: batch.trim(),
      admissionDate: new Date(admissionDate),
      status: status || "active",
      avatarColor: avatarColor || "#1F3354",
      photoUrl: photoUrl || "",
    };
    if (password) createData.passwordHash = await hashPassword(String(password));
    const doc = await Student.create(createData);

    return NextResponse.json({ success: true, data: { id: String(doc._id), ...doc.toObject() } }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST students]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      if (msg.includes("rollNumber")) return NextResponse.json({ success: false, error: "Roll number already exists" }, { status: 409 });
      if (msg.includes("email")) return NextResponse.json({ success: false, error: "Email already exists" }, { status: 409 });
      return NextResponse.json({ success: false, error: "Duplicate entry" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to create student" }, { status: 500 });
  }
}

