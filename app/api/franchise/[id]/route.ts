import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FranchiseApplication from "@/models/FranchiseApplication";

const ALLOWED_FIELDS = [
  "name", "ownerName", "instituteName", "email", "phone",
  "city", "state", "message", "duration", "documentUrl", "documentName",
  "status", "approvedBy", "rejectionReason",
];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await FranchiseApplication.findOne({ _id: params.id, deletedAt: { $exists: false } }).lean() as any;
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id:            String(doc._id),
        name:          doc.name          ?? "",
        ownerName:     doc.ownerName     ?? "",
        instituteName: doc.instituteName ?? "",
        email:         doc.email         ?? "",
        phone:         doc.phone         ?? "",
        city:          doc.city          ?? "",
        state:         doc.state         ?? "",
        message:       doc.message       ?? "",
        duration:      doc.duration      ?? "",
        startDate:     doc.startDate ? new Date(doc.startDate).toISOString().slice(0, 10) : "",
        endDate:       doc.endDate   ? new Date(doc.endDate).toISOString().slice(0, 10)   : "",
        documentUrl:   doc.documentUrl   ?? "",
        documentName:  doc.documentName  ?? "",
        date:          doc.date ? new Date(doc.date).toISOString().slice(0, 10) : "",
        status:        doc.status        ?? "pending",
        approvedAt:    doc.approvedAt ? new Date(doc.approvedAt).toISOString().slice(0, 10) : "",
        rejectionReason: doc.rejectionReason ?? "",
      },
    });
  } catch (e) {
    console.error("[GET franchise/id]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const b = await req.json();
    const update: any = {};

    for (const k of ALLOWED_FIELDS) {
      if (b[k] !== undefined) update[k] = b[k];
    }

    // Date fields
    if (b.startDate !== undefined) update.startDate = b.startDate ? new Date(b.startDate) : undefined;
    if (b.endDate   !== undefined) update.endDate   = b.endDate   ? new Date(b.endDate)   : undefined;

    // If approving, stamp approvedAt
    if (b.status === "approved") {
      update.approvedAt = new Date();
    }
    // If rejecting, clear approvedAt
    if (b.status === "rejected") {
      update.approvedAt = undefined;
    }

    const doc = await FranchiseApplication.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } },
      update,
      { new: true }
    );
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    console.error("[PUT franchise/id]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const doc = await FranchiseApplication.findOneAndUpdate(
      { _id: params.id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!doc) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error("[DELETE franchise/id]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
