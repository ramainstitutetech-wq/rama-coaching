export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Course from "@/models/Course";
import { hashPassword } from "@/lib/auth";

async function findFreeRollNumber() {
  const year = new Date().getFullYear();
  const prefix = `RCC/${year}/`;
  // Find all rollNumbers for this year and compute max numeric value (handles gaps and soft-deleted)
  const docs = await Student.find({ rollNumber: { $regex: `^${prefix}` } }).select("rollNumber").lean();
  let max = 0;
  for (const d of docs as any[]) {
    const m = String(d.rollNumber).match(/\/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > max) max = n;
    }
  }
  // Start from max+1 and find first free slot (professional: never reuse occupied)
  let candidateNum = max + 1;
  // Safety: prevent infinite loop
  for (let i = 0; i < 100; i++) {
    const candidate = `${prefix}${String(candidateNum).padStart(4, "0")}`;
    const exists = await Student.findOne({ rollNumber: candidate }).select("_id").lean();
    if (!exists) return candidate;
    candidateNum++;
  }
  throw new Error("No free roll number available");
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      fullName, parentName, motherName, dob, gender, category, religion,
      phone, email, address, addressLine1, addressLine2, addressLine3, cityName, courseId, batch,
      maritalStatus, handicapped, exServiceman, ews, visibleMark, stdPhone,
      qualification, passingYear, aadhaarNumber, apaarId,
      password, confirmPassword,
      aadhaarCardUrl, marksheetUrl, marksheet10Url, marksheet12Url, photoUrl, signatureUrl, thumbUrl,
    } = body;

    // Validations
    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !courseId) {
      return NextResponse.json({ success: false, error: "Name, Email, Phone, Course are required" }, { status: 400 });
    }
    if (!motherName?.trim()) return NextResponse.json({ success: false, error: "Mother's Name is required" }, { status: 400 });
    if (!religion?.trim()) return NextResponse.json({ success: false, error: "Religion is required" }, { status: 400 });
    if (!visibleMark?.trim()) return NextResponse.json({ success: false, error: "Visible Mark is required" }, { status: 400 });
    const effectiveAddress = (address?.trim() || addressLine1?.trim() || "");
    if (!effectiveAddress || !cityName?.trim()) return NextResponse.json({ success: false, error: "Address and City are required" }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ success: false, error: "Password min 6 chars" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 });
    if (aadhaarNumber && !/^\d{12}$/.test(String(aadhaarNumber).replace(/\s/g,""))) return NextResponse.json({ success: false, error: "Aadhaar must be 12 digits" }, { status: 400 });

    const cleanEmail = String(email).toLowerCase().trim();
    const exists = await Student.findOne({ email: cleanEmail });
    if (exists) return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });

    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ success: false, error: "Invalid course" }, { status: 400 });

    const passwordHash = await hashPassword(String(password));

    // Professional retry: find last roll number, +1, if occupied then next — never reuse occupied
    let doc: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const rollNumber = await findFreeRollNumber();
      try {
        const combinedAddress = [effectiveAddress, cityName].filter(Boolean).join(", ") || address || "";
        doc = await Student.create({
          fullName: String(fullName).trim(),
          rollNumber,
          email: cleanEmail,
          phone: String(phone).trim(),
          courseId: course._id,
          courseName: course.name,
          batch: batch || "Pending",
          admissionDate: new Date(),
          status: "pending",
          avatarColor: "#1F3354",
          photoUrl: photoUrl || "",
          passwordHash,
          tempPassword: String(password),
          parentName: parentName || "",
          motherName: motherName || "",
          dob: dob ? new Date(dob) : undefined,
          gender: gender || undefined,
          category: category || "",
          religion: religion || "",
          maritalStatus: (maritalStatus as string) || "",
          handicapped: (handicapped as string) || "",
          exServiceman: (exServiceman as string) || "",
          ews: (ews as string) || "",
          address: combinedAddress,
          addressLine1: effectiveAddress || "",
          addressLine2: (addressLine2 as string) || "",
          addressLine3: (addressLine3 as string) || "",
          cityName: cityName || "",
          stdPhone: (stdPhone as string) || "",
          visibleMark: (visibleMark as string) || "",
          qualification: qualification || "",
          passingYear: passingYear || "",
          aadhaarNumber: aadhaarNumber ? String(aadhaarNumber).replace(/\s/g,"") : "",
          apaarId: apaarId || "",
          aadhaarCardUrl: aadhaarCardUrl || "",
          marksheetUrl: marksheetUrl || marksheet10Url || "",
          marksheet10Url: marksheet10Url || marksheetUrl || "",
          marksheet12Url: marksheet12Url || "",
          signatureUrl: signatureUrl || "",
          thumbUrl: thumbUrl || "",
        });
        break;
      } catch (err: any) {
        if (err?.code === 11000 && err?.keyPattern?.rollNumber) {
          lastError = err;
          // Race condition: another request took this rollNumber, wait a bit and retry (findFree will get next)
          await new Promise(r => setTimeout(r, 50 * (attempt + 1)));
          continue;
        }
        if (err?.code === 11000 && err?.keyPattern?.email) {
          return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
        }
        throw err;
      }
    }
    if (!doc) {
      console.error("[register] failed after retries", lastError);
      return NextResponse.json({ success: false, error: "Could not generate roll number, please try again" }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: "Registration submitted, pending approval", data: { id: String(doc._id), rollNumber: doc.rollNumber, status: doc.status } });
  } catch (e: any) {
    console.error("[register]", e);
    // Handle Mongo connection errors with friendly message
    if (e?.name === "MongoServerSelectionError" || e?.name === "MongoNetworkError" || e?.message?.includes("ENOTFOUND") || e?.message?.includes("closed")) {
      return NextResponse.json({ success: false, error: "Database temporarily busy, please try again in a moment" }, { status: 503 });
    }
    if (e?.code === 11000) {
      if (e?.keyPattern?.email) return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
      return NextResponse.json({ success: false, error: "Duplicate entry, please try again" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Server error, please try again" }, { status: 500 });
  }
}
