import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FeeRecord from "@/models/FeeRecord";
import { sendFeeReceiptEmail, sendFeeReminderEmail } from "@/lib/email";

type Ctx = { params: { id: string } };

// ─── GET: Single fee record detail ───────────────────────────────────────────
export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const record = await FeeRecord.findById(params.id).lean();
    if (!record) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const r = record as any;
    return NextResponse.json({
      success: true,
      data: {
        id: String(r._id),
        rollNumber: r.rollNumber,
        studentName: r.studentName,
        phone: r.phone,
        email: r.email || "",
        courseName: r.courseName,
        batch: r.batch || "",
        courseFee: r.courseFee || 0,
        registrationFee: r.registrationFee || 0,
        totalFees: r.totalFees,
        discount: r.discount || 0,
        finalFees: r.finalFees,
        paidAmount: r.paidAmount,
        dueAmount: r.dueAmount,
        status: r.status,
        dueDate: r.dueDate || null,
        remarks: r.remarks || "",
        payments: (r.payments || []).map((p: any) => ({
          id: String(p._id),
          receiptNo: p.receiptNo,
          amount: p.amount,
          paymentDate: p.paymentDate,
          paymentMode: p.paymentMode,
          transactionId: p.transactionId || "",
          remarks: p.remarks || "",
          collectedBy: p.collectedBy || "Admin",
        })),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      },
    });
  } catch (err) {
    console.error("[GET /api/fees/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 });
  }
}

// ─── PUT: Update (add discount / update remarks / send receipt/reminder) ──────
export async function PUT(req: Request, { params }: Ctx) {
  try {
    await connectDB();
    const body = await req.json();
    const record = await FeeRecord.findById(params.id);
    if (!record) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Send fee receipt email for a specific payment
    if (body.action === "send_receipt") {
      const payment = record.payments.find((p: any) => String(p._id) === body.paymentId || p.receiptNo === body.receiptNo);
      if (!payment) return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
      if (!record.email) return NextResponse.json({ success: false, error: "No email on record" }, { status: 400 });

      await sendFeeReceiptEmail({
        to: record.email,
        name: record.studentName,
        rollNumber: record.rollNumber,
        courseName: record.courseName,
        receiptNo: (payment as any).receiptNo,
        amountPaid: (payment as any).amount,
        totalFees: record.finalFees,
        dueAmount: record.dueAmount,
        paymentMode: (payment as any).paymentMode,
        paymentDate: new Date((payment as any).paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      });
      return NextResponse.json({ success: true, message: "Receipt email sent" });
    }

    // Send fee reminder email
    if (body.action === "send_reminder") {
      if (!record.email) return NextResponse.json({ success: false, error: "No email on record" }, { status: 400 });
      if (record.dueAmount <= 0) return NextResponse.json({ success: false, error: "No due amount" }, { status: 400 });

      await sendFeeReminderEmail({
        to: record.email,
        name: record.studentName,
        rollNumber: record.rollNumber,
        courseName: record.courseName,
        totalFees: record.finalFees,
        paidAmount: record.paidAmount,
        dueAmount: record.dueAmount,
        dueDate: record.dueDate ? new Date(record.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
      });
      return NextResponse.json({ success: true, message: "Reminder email sent" });
    }

    // Update discount / dueDate / remarks
    if (typeof body.discount === "number") {
      record.discount = Math.max(0, body.discount);
      record.finalFees = Math.max(0, record.totalFees - record.discount);
      record.dueAmount = Math.max(0, record.finalFees - record.paidAmount);
      record.status = record.dueAmount <= 0 ? "paid" : record.paidAmount > 0 ? "partial" : "unpaid";
    }
    if (body.dueDate !== undefined) record.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    if (body.remarks !== undefined) record.remarks = body.remarks;

    await record.save();
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    console.error("[PUT /api/fees/[id]]", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to update" }, { status: 500 });
  }
}

// ─── DELETE: Soft-delete fee record ──────────────────────────────────────────
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await connectDB();
    await FeeRecord.findByIdAndUpdate(params.id, { deletedAt: new Date() });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/fees/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
