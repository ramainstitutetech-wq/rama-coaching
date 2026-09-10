import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStudent extends Document {
  fullName: string;
  rollNumber: string;
  email: string;
  phone: string;
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  courseFree: string;
  batch: string;
  admissionDate: Date;
  status: "active" | "completed" | "pending" | "inactive";
  avatarColor: string;
  photoUrl?: string;
  passwordHash?: string;
  deletedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Registration flow fields
  parentName?: string;
  dob?: Date;
  gender?: "male" | "female" | "other";
  category?: string;
  address?: string;
  qualification?: string;
  passingYear?: string;
  aadhaarNumber?: string;
  apaarId?: string;
  aadhaarCardUrl?: string;
  marksheetUrl?: string;
  signatureUrl?: string;
  thumbUrl?: string;
  tempPassword?: string; // plain for activation email, cleared after Active
}

const StudentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseName: { type: String, required: true },
    courseFree: { type: String, default: "" },
    batch: { type: String, required: true },
    admissionDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "pending", "inactive"], default: "pending" },
    avatarColor: { type: String, default: "#1F3354" },
    photoUrl: { type: String, default: "" },
    passwordHash: { type: String, select: false },
    deletedAt: { type: Date },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    parentName: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"], default: undefined },
    category: { type: String, default: "" },
    address: { type: String, default: "" },
    qualification: { type: String, default: "" },
    passingYear: { type: String, default: "" },
    aadhaarNumber: { type: String, default: "" },
    apaarId: { type: String, default: "" },
    aadhaarCardUrl: { type: String, default: "" },
    marksheetUrl: { type: String, default: "" },
    signatureUrl: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    tempPassword: { type: String, default: "", select: false },
  },
  { timestamps: true }
);

StudentSchema.index({ courseId: 1 });
StudentSchema.index({ status: 1 });

export default (mongoose.models.Student as Model<IStudent>) || mongoose.model<IStudent>("Student", StudentSchema);
