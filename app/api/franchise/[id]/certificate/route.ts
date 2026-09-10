export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FranchiseApplication from "@/models/FranchiseApplication";
import FranchiseCertificate from "@/models/FranchiseCertificate";

// ── Generate sequential certificate number ─────────────────────────────────
async function generateCertNumber(): Promise<string> {
  const year  = new Date().getFullYear();
  const count = await FranchiseCertificate.countDocuments({});
  const seq   = String(count + 1).padStart(4, "0");
  return `RCC/FRAN/${year}/${seq}`;
}

// ── GET — fetch existing certificate for this application ──────────────────
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const cert = await FranchiseCertificate.findOne({
      applicationId: params.id,
      deletedAt: { $exists: false },
    }).lean() as any;

    if (!cert) return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: serializeCert(cert),
    });
  } catch (e) {
    console.error("[GET franchise cert]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

// ── POST — generate franchise certificate (only if application is approved) ─
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // 1. Fetch the application
    const app = await FranchiseApplication.findOne({
      _id: params.id,
      deletedAt: { $exists: false },
    }).lean() as any;

    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (app.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Application must be approved before generating a certificate" },
        { status: 400 }
      );
    }

    // 2. Idempotency — return existing cert if already issued
    const existing = await FranchiseCertificate.findOne({ applicationId: params.id }).lean() as any;
    if (existing) {
      return NextResponse.json({ success: true, data: serializeCert(existing), alreadyExists: true });
    }

    // 3. Generate and create certificate
    const certificateNumber = await generateCertNumber();
    const cert = await FranchiseCertificate.create({
      applicationId:     app._id,
      certificateNumber,
      ownerName:         app.ownerName     || app.name,
      instituteName:     app.instituteName || "",
      city:              app.city,
      state:             app.state,
      duration:          app.duration      || "",
      startDate:         app.startDate,
      endDate:           app.endDate,
      issueDate:         new Date(),
      status:            "issued",
    });

    return NextResponse.json({ success: true, data: serializeCert(cert) }, { status: 201 });
  } catch (e) {
    console.error("[POST franchise cert]", e);
    return NextResponse.json({ success: false, error: "Failed to generate certificate" }, { status: 500 });
  }
}

// ── DELETE — revoke certificate ────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const cert = await FranchiseCertificate.findOneAndUpdate(
      { applicationId: params.id },
      { status: "revoked", revokedAt: new Date() },
      { new: true }
    );
    if (!cert) return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Certificate revoked" });
  } catch (e) {
    console.error("[DELETE franchise cert]", e);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

function serializeCert(c: any) {
  return {
    id:                String(c._id),
    applicationId:     String(c.applicationId),
    certificateNumber: c.certificateNumber,
    ownerName:         c.ownerName     ?? "",
    instituteName:     c.instituteName ?? "",
    city:              c.city          ?? "",
    state:             c.state         ?? "",
    duration:          c.duration      ?? "",
    startDate:         c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "",
    endDate:           c.endDate   ? new Date(c.endDate).toISOString().slice(0, 10)   : "",
    issueDate:         c.issueDate ? new Date(c.issueDate).toISOString().slice(0, 10) : "",
    status:            c.status    ?? "issued",
  };
}
