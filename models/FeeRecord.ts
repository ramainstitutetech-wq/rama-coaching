import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPaymentInstallment {
  receiptNo: string;
  amount: number;
  paymentDate: Date;
  paymentMode: "Cash" | "UPI" | "Bank" | "Cheque" | "Other";
  transactionId?: string;
  remarks?: string;
  collectedBy?: string;
}

export interface IFeeRecord extends Document {
  studentId?: mongoose.Types.ObjectId;
  rollNumber: string;
  studentName: string;
  phone: string;
  email?: string;
  courseName: string;
  courseId?: mongoose.Types.ObjectId;
  batch?: string;
  courseFee: number;
  registrationFee: number;
  totalFees: number;
  discount: number;
  finalFees: number;
  paidAmount: number;
  dueAmount: number;
  status: "paid" | "partial" | "unpaid";
  payments: IPaymentInstallment[];
  dueDate?: Date;
  remarks?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentInstallmentSchema = new Schema<IPaymentInstallment>(
  {
    receiptNo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ["Cash", "UPI", "Bank", "Cheque", "Other"], default: "Cash" },
    transactionId: { type: String, default: "" },
    remarks: { type: String, default: "" },
    collectedBy: { type: String, default: "Admin" },
  },
  { _id: true, timestamps: false }
);

const FeeRecordSchema = new Schema<IFeeRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    rollNumber: { type: String, required: true, trim: true, index: true },
    studentName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    courseName: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    batch: { type: String, default: "" },
    courseFee: { type: Number, default: 0, min: 0 },
    registrationFee: { type: Number, default: 0, min: 0 },
    totalFees: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalFees: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["paid", "partial", "unpaid"], default: "unpaid", index: true },
    payments: { type: [PaymentInstallmentSchema], default: [] },
    dueDate: { type: Date },
    remarks: { type: String, default: "" },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

FeeRecordSchema.index({ rollNumber: 1, deletedAt: 1 });
FeeRecordSchema.index({ status: 1, deletedAt: 1 });
FeeRecordSchema.index({ phone: 1, deletedAt: 1 });

export default (mongoose.models.FeeRecord as Model<IFeeRecord>) ||
  mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema);
