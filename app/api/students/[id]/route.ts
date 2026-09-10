import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Course from "@/models/Course";
import { hashPassword } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Student.findOne({ _id: params.id, deletedAt: { $exists: false } }).lean() as any | null;
    if (!doc) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        id: String(doc["_id"]),
        fullName: doc["fullName"],
        rollNumber: doc["rollNumber"],
        email: doc["email"],
        phone: doc["phone"],
        course: doc["courseName"],
        courseId: String(doc["courseId"] || ""),
        batch: doc["batch"],
        admissionDate: doc["admissionDate"] ? new Date(doc["admissionDate"] as string).toISOString().slice(0, 10) : "",
        status: doc["status"],
        avatarColor: doc["avatarColor"],
        photoUrl: doc["photoUrl"] || "",
      },
    });
  } catch (err) {
    console.error("[GET student]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, rollNumber, email, phone, course, courseFree, batch, admissionDate, status, avatarColor, photoUrl, password } = body;

    const courseName = course === "other" ? (courseFree?.trim() || "") : (course?.trim() || "");
    if (courseName) {
      let courseDoc = await Course.findOne({ name: courseName });
      if (!courseDoc) {
        courseDoc = await Course.create({ name: courseName, description: `${courseName} course`, duration: "6 Months", fees: "₹0", category: "General", status: "active" });
      }
      body.courseId = courseDoc._id;
      body.courseName = courseName;
    }

    const update: any = {};
    if (fullName !== undefined) update.fullName = fullName.trim();
    if (rollNumber !== undefined) update.rollNumber = rollNumber.trim();
    if (email !== undefined) update.email = email.trim().toLowerCase();
    if (phone !== undefined) update.phone = phone.trim();
    if (batch !== undefined) update.batch = batch.trim();
    if (admissionDate !== undefined) update.admissionDate = new Date(admissionDate);
    if (status !== undefined) update.status = status;
    if (avatarColor !== undefined) update.avatarColor = avatarColor;
    if (photoUrl !== undefined) update.photoUrl = photoUrl;
    if (password) {
      if (String(password).length < 6) return NextResponse.json({ success: false, error: "Password min 6 chars" }, { status: 400 });
      update.passwordHash = await hashPassword(String(password));
    }
    if (courseName) { update.courseName = courseName; update.courseId = body.courseId; update.courseFree = course === "other" ? courseFree?.trim() : ""; }

    const doc = await Student.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, update, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (err: unknown) {
    console.error("[PUT student]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate key") || msg.includes("E11000")) {
      return NextResponse.json({ success: false, error: "Duplicate roll number or email" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await Student.findOneAndUpdate({ _id: params.id, deletedAt: { $exists: false } }, { deletedAt: new Date() }, { new: true });
    if (!doc) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE student]", err);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
