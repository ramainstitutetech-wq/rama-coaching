export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FranchiseApplication from "@/models/FranchiseApplication";

function serializeApp(x: any) {
  return {
    id:            String(x["_id"]),
    name:          x.name          ?? "",
    ownerName:     x.ownerName     ?? "",
    instituteName: x.instituteName ?? "",
    email:         x.email         ?? "",
    phone:         x.phone         ?? "",
    city:          x.city          ?? "",
    state:         x.state         ?? "",
    message:       x.message       ?? "",
    duration:      x.duration      ?? "",
    startDate:     x.startDate ? new Date(x.startDate).toISOString().slice(0, 10) : "",
    endDate:       x.endDate   ? new Date(x.endDate).toISOString().slice(0, 10)   : "",
    documentUrl:   x.documentUrl  ?? "",
    documentName:  x.documentName ?? "",
    date:          x.date ? new Date(x.date).toISOString().slice(0, 10) : "",
    status:        x.status        ?? "pending",
    approvedAt:    x.approvedAt ? new Date(x.approvedAt).toISOString().slice(0, 10) : "",
    rejectionReason: x.rejectionReason ?? "",
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page   = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip   = (page - 1) * limit;

    const filter: any = { deletedAt: { $exists: false } };
    if (q) {
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter["$or"] = [{ name: r }, { email: r }, { city: r }, { state: r }, { instituteName: r }, { ownerName: r }];
    }
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      FranchiseApplication.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FranchiseApplication.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map(serializeApp),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error("[GET franchise]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const b = await req.json();

    if (!b.name?.trim() || !b.email?.trim() || !b.phone?.trim() || !b.city?.trim() || !b.state?.trim()) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const doc = await FranchiseApplication.create({
      name:          b.name.trim(),
      ownerName:     b.ownerName?.trim()     || "",
      instituteName: b.instituteName?.trim() || "",
      email:         b.email.trim().toLowerCase(),
      phone:         b.phone.trim(),
      city:          b.city.trim(),
      state:         b.state.trim(),
      message:       b.message?.trim()      || "",
      duration:      b.duration?.trim()     || "",
      startDate:     b.startDate ? new Date(b.startDate) : undefined,
      endDate:       b.endDate   ? new Date(b.endDate)   : undefined,
      documentUrl:   b.documentUrl?.trim()  || "",
      documentName:  b.documentName?.trim() || "",
      status:        "pending",
      date:          new Date(),
    });

    return NextResponse.json({ success: true, data: serializeApp(doc) }, { status: 201 });
  } catch (e) {
    console.error("[POST franchise]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
