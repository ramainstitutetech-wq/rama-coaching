import mongoose, { Document, Schema, Model } from "mongoose";

export interface IHallTicket extends Document {
  ticketNumber: string;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  rollNo: string;
  courseName: string;
  courseCode?: string;
  batch?: string;
  examName: string;
  examDate: Date;
  examCenter: string;
  examTime?: string;
  hallNo?: string;
  photoUrl?: string;
  signatureUrl?: string;
  issuedById?: mongoose.Types.ObjectId;
  status: "issued" | "pending" | "cancelled";
  isSentToStudent: boolean;
  validTill?: Date;
  deletedAt?: Date;
}

const HallTicketSchema = new Schema<IHallTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    rollNo: { type: String, required: true },
    courseName: { type: String, required: true },
    courseCode: { type: String, default: "" },
    batch: { type: String, default: "" },
    examName: { type: String, required: true },
    examDate: { type: Date, required: true },
    examCenter: { type: String, required: true },
    examTime: { type: String, default: "" },
    hallNo: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    signatureUrl: { type: String, default: "" },
    issuedById: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["issued", "pending", "cancelled"], default: "issued" },
    isSentToStudent: { type: Boolean, default: true },
    validTill: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

HallTicketSchema.index({ studentId: 1 });
HallTicketSchema.index({ courseId: 1 });
HallTicketSchema.index({ status: 1 });

export default (mongoose.models.HallTicket as Model<IHallTicket>) || mongoose.model<IHallTicket>("HallTicket", HallTicketSchema);
