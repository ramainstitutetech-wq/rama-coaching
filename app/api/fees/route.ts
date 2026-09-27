import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FeeRecord from "@/models/FeeRecord";
import Student from "@/models/Student";

// Helper: auto-generate receipt number
async function nextReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await FeeRecord.countDocuments({});
  const seq = String(count + 1).padStart(4, "0");
  return `RCC-FEE-${year}-${seq}`;
}

// ─── GET: List fee records ────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || ""; // paid | partial | unpaid
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter["$or"] = [
        { studentName: regex },
        { rollNumber: regex },
        { phone: regex },
        { courseName: regex },
      ];
    }
    if (status && status !== "all") filter.status = status;

    const [items, total] = await Promise.all([
      FeeRecord.find(filter)
        .select("rollNumber studentName phone email courseName batch totalFees finalFees paidAmount dueAmount discount status dueDate payments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FeeRecord.countDocuments(filter),
    ]);

    // Summary stats (for dashboard cards)
    const [statsAll] = await FeeRecord.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      {
        $group: {
          _id: null,
          totalExpected: { $sum: "$finalFees" },
          totalCollected: { $sum: "$paidAmount" },
          totalDue: { $sum: "$dueAmount" },
        },
      },
    ]);

    // Today's collection
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const [todayStats] = await FeeRecord.aggregate([
      { $match: { deletedAt: { $exists: false } } },
      { $unwind: "$payments" },
      { $match: { "payments.paymentDate": { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayCollection: { $sum: "$payments.amount" } } },
    ]);

    const summary = {
      totalExpected:  statsAll?.totalExpected  || 0,
      totalCollected: statsAll?.totalCollected || 0,
      totalDue:       statsAll?.totalDue       || 0,
      todayCollection: todayStats?.todayCollection || 0,
    };

    return NextResponse.json({
      success: true,
      data: items.map((r: any) => ({
        id: String(r._id),
        rollNumber: r.rollNumber,
        studentName: r.studentName,
        phone: r.phone,
        email: r.email || "",
        courseName: r.courseName,
        batch: r.batch || "",
        totalFees: r.totalFees,
        finalFees: r.finalFees,
        paidAmount: r.paidAmount,
        dueAmount: r.dueAmount,
        discount: r.discount || 0,
        status: r.status,
        dueDate: r.dueDate || null,
        paymentsCount: (r.payments || []).length,
        lastPayment: (r.payments || []).at(-1) || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      summary,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/fees]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch fee records" }, { status: 500 });
  }
}

// ─── POST: Create fee record OR collect a payment ──────────────────────────────
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // If action = "collect" on an existing record
    if (body.action === "collect" && body.feeRecordId) {
      const record = await FeeRecord.findById(body.feeRecordId);
      if (!record) return NextResponse.json({ success: false, error: "Fee record not found" }, { status: 404 });

      const amount = Number(body.amount);
      if (!amount || amount <= 0) return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
      if (amount > record.dueAmount + 0.01) return NextResponse.json({ success: false, error: `Amount ₹${amount} exceeds due ₹${record.dueAmount}` }, { status: 400 });

      const receiptNo = await nextReceiptNo();
      record.payments.push({
        receiptNo,
        amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        paymentMode: body.paymentMode || "Cash",
        transactionId: body.transactionId || "",
        remarks: body.remarks || "",
        collectedBy: body.collectedBy || "Admin",
      });
      record.paidAmount += amount;
      record.dueAmount   = Math.max(0, record.finalFees - record.paidAmount);
      record.status = record.dueAmount <= 0 ? "paid" : record.paidAmount > 0 ? "partial" : "unpaid";
      await record.save();

      return NextResponse.json({ success: true, data: record, receiptNo });
    }

    // Create new fee record
    const {
      studentId, rollNumber, studentName, phone, email,
      courseName, courseId, batch,
      courseFee, registrationFee, discount, dueDate, remarks,
    } = body;

    if (!rollNumber || !studentName || !phone || !courseName) {
      return NextResponse.json({ success: false, error: "rollNumber, studentName, phone, courseName are required" }, { status: 400 });
    }

    // Avoid duplicate
    const existing = await FeeRecord.findOne({ rollNumber: rollNumber.trim(), deletedAt: { $exists: false } });
    if (existing) return NextResponse.json({ success: false, error: "Fee record already exists for this roll number" }, { status: 409 });

    const cFee  = Number(courseFee) || 0;
    const rFee  = Number(registrationFee) || 0;
    const disc  = Number(discount) || 0;
    const total = cFee + rFee;
    const final = Math.max(0, total - disc);

    const record = await FeeRecord.create({
      studentId: studentId || undefined,
      rollNumber: rollNumber.trim(),
      studentName: studentName.trim(),
      phone: phone.trim(),
      email: (email || "").trim().toLowerCase(),
      courseName: courseName.trim(),
      courseId: courseId || undefined,
      batch: batch || "",
      courseFee: cFee,
      registrationFee: rFee,
      totalFees: total,
      discount: disc,
      finalFees: final,
      paidAmount: 0,
      dueAmount: final,
      status: "unpaid",
      payments: [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
      remarks: remarks || "",
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/fees]", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to create fee record" }, { status: 500 });
  }
}
