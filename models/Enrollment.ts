import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEnrollment extends Document {
  enrollmentId: string; // RCC-ENR-2026-XXXX unique
  courseId: mongoose.Types.ObjectId;
  courseName: string;
  courseFees: string;
  // Applicant
  applicantType: "student" | "outsider";
  studentId?: mongoose.Types.ObjectId; // if logged-in student
  fullName: string;
  email: string;
  phone: string;
  fatherName?: string;
  address?: string;
  education?: string;
  // Payment proof
  amount: string; // should match courseFees
  utr: string; // UPI Transaction ID - unique
  proofUrl: string; // /uploads/...
  paymentDate?: Date;
  // Status
  status: "pending_verification" | "approved" | "rejected" | "expired";
  rejectionReason?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  // Expiry — per enrollment
  enrolledAt?: Date;
  expiresAt?: Date; // null = lifetime
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    enrollmentId: { type: String, required: true, unique: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    courseName: { type: String, required: true },
    courseFees: { type: String, required: true },
    applicantType: { type: String, enum: ["student", "outsider"], required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    fatherName: { type: String, default: "" },
    address: { type: String, default: "" },
    education: { type: String, default: "" },
    amount: { type: String, required: true },
    utr: { type: String, required: true, unique: true },
    proofUrl: { type: String, required: true },
    paymentDate: { type: Date },
    status: { type: String, enum: ["pending_verification", "approved", "rejected", "expired"], default: "pending_verification" },
    rejectionReason: { type: String, default: "" },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    enrolledAt: { type: Date },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ status: 1 });
EnrollmentSchema.index({ courseId: 1 });
EnrollmentSchema.index({ email: 1 });
EnrollmentSchema.index({ phone: 1 });

export default (mongoose.models.Enrollment as Model<IEnrollment>) || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
