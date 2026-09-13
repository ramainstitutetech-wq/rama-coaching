import mongoose, { Document, Schema, Model } from "mongoose";

export interface IIDCard extends Document {
  cardNumber: string;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  rollNo: string;
  courseName: string;
  courseCode?: string;
  batch?: string;
  dob?: Date;
  phone?: string;
  address?: string;
  photoUrl?: string;
  issueDate: Date;
  validTill: Date;
  issuedById?: mongoose.Types.ObjectId;
  status: "active" | "expired" | "cancelled";
  isSentToStudent: boolean;
  deletedAt?: Date;
}

const IDCardSchema = new Schema<IIDCard>(
  {
    cardNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    rollNo: { type: String, required: true },
    courseName: { type: String, required: true },
    courseCode: { type: String, default: "" },
    batch: { type: String, default: "" },
    dob: { type: Date },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    issueDate: { type: Date, required: true },
    validTill: { type: Date, required: true },
    issuedById: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    isSentToStudent: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

IDCardSchema.index({ studentId: 1 });
IDCardSchema.index({ courseId: 1 });
IDCardSchema.index({ status: 1 });

export default (mongoose.models.IDCard as Model<IIDCard>) || mongoose.model<IIDCard>("IDCard", IDCardSchema);
