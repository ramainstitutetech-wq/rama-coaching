import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMarkRow extends Document {
  paper: string;
  subject: string;
  theoryMax: number;
  theoryMin: number;
  practicalMax: number;
  practicalMin: number;
  total: number;
  grade: string;
}

export interface ICertificate extends Document {
  certificateNumber: string;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  documentType: "excellence" | "marksheet";
  type: "excellence" | "marksheet";
  slNo: string;
  rollNo: string;
  enrollmentNo: string;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  courseCode: string;
  courseName: string;
  completionDate: Date;
  trainingCenter: string;
  centerCode?: string;
  performance?: string;
  courseDuration?: string;
  photoUrl?: string;
  issuedById?: mongoose.Types.ObjectId;
  issueDate: Date;
  status: "issued" | "pending" | "revoked";
  dated: string;
  place: string;
  subjects?: IMarkRow[];
  isSentToStudent: boolean;
  deletedAt?: Date;
}

const MarkRowSchema = new Schema<IMarkRow>(
  {
    paper: { type: String, required: true },
    subject: { type: String, required: true },
    theoryMax: { type: Number, required: true },
    theoryMin: { type: Number, required: true },
    practicalMax: { type: Number, required: true },
    practicalMin: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { _id: false }
);

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    documentType: { type: String, enum: ["excellence", "marksheet"], required: true },
    type: { type: String, enum: ["excellence", "marksheet"], required: true },
    slNo: { type: String, required: true },
    rollNo: { type: String, required: true },
    enrollmentNo: { type: String, required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },
    completionDate: { type: Date, required: true },
    trainingCenter: { type: String, required: true },
    centerCode: { type: String },
    performance: { type: String },
    courseDuration: { type: String },
    photoUrl: { type: String },
    issuedById: { type: Schema.Types.ObjectId, ref: "User" },
    issueDate: { type: Date, required: true },
    status: { type: String, enum: ["issued", "pending", "revoked"], default: "issued" },
    dated: { type: String, required: true },
    place: { type: String, required: true },
    subjects: { type: [MarkRowSchema], default: [] },
    isSentToStudent: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

CertificateSchema.index({ studentId: 1 });
CertificateSchema.index({ courseId: 1 });
CertificateSchema.index({ status: 1 });
CertificateSchema.index({ issueDate: 1 });

export default (mongoose.models.Certificate as Model<ICertificate>) || mongoose.model<ICertificate>("Certificate", CertificateSchema);
