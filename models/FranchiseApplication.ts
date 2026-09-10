import mongoose, { Document, Schema, Model } from "mongoose";

export interface IFranchiseApplication extends Document {
  // Applicant details
  name: string;
  ownerName: string;
  instituteName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  message: string;
  // Franchise period
  duration: string;       // e.g. "1 Year", "2 Years"
  startDate?: Date;
  endDate?: Date;
  // Document upload (URL after upload)
  documentUrl?: string;
  documentName?: string;
  // Workflow
  status: "pending" | "contacted" | "approved" | "rejected";
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  date: Date;
  deletedAt?: Date;
}

const FranchiseApplicationSchema = new Schema<IFranchiseApplication>(
  {
    name:          { type: String, required: true },
    ownerName:     { type: String, default: "" },
    instituteName: { type: String, default: "" },
    email:         { type: String, required: true },
    phone:         { type: String, required: true },
    city:          { type: String, required: true },
    state:         { type: String, required: true },
    message:       { type: String, default: "" },
    duration:      { type: String, default: "" },
    startDate:     { type: Date },
    endDate:       { type: Date },
    documentUrl:   { type: String, default: "" },
    documentName:  { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "contacted", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    approvedAt:       { type: Date },
    approvedBy:       { type: String, default: "" },
    rejectionReason:  { type: String, default: "" },
    date:        { type: Date, default: Date.now },
    deletedAt:   { type: Date },
  },
  { timestamps: true }
);

FranchiseApplicationSchema.index({ status: 1 });
FranchiseApplicationSchema.index({ createdAt: 1 });

export default (mongoose.models.FranchiseApplication as Model<IFranchiseApplication>) ||
  mongoose.model<IFranchiseApplication>("FranchiseApplication", FranchiseApplicationSchema);
