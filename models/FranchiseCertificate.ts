import mongoose, { Document, Schema, Model } from "mongoose";

export interface IFranchiseCertificate extends Document {
  applicationId: mongoose.Types.ObjectId;
  certificateNumber: string;   // e.g. RCC/FRAN/2026/0001
  ownerName: string;
  instituteName: string;
  city: string;
  state: string;
  duration: string;
  startDate?: Date;
  endDate?: Date;
  issueDate: Date;
  status: "issued" | "revoked";
  revokedAt?: Date;
  deletedAt?: Date;
}

const FranchiseCertificateSchema = new Schema<IFranchiseCertificate>(
  {
    applicationId:     { type: Schema.Types.ObjectId, ref: "FranchiseApplication", required: true, unique: true },
    certificateNumber: { type: String, required: true, unique: true },
    ownerName:         { type: String, required: true },
    instituteName:     { type: String, required: true },
    city:              { type: String, required: true },
    state:             { type: String, required: true },
    duration:          { type: String, default: "" },
    startDate:         { type: Date },
    endDate:           { type: Date },
    issueDate:         { type: Date, default: Date.now },
    status:            { type: String, enum: ["issued", "revoked"], default: "issued" },
    revokedAt:         { type: Date },
    deletedAt:         { type: Date },
  },
  { timestamps: true }
);

FranchiseCertificateSchema.index({ applicationId: 1 });
FranchiseCertificateSchema.index({ certificateNumber: 1 });

export default (mongoose.models.FranchiseCertificate as Model<IFranchiseCertificate>) ||
  mongoose.model<IFranchiseCertificate>("FranchiseCertificate", FranchiseCertificateSchema);
