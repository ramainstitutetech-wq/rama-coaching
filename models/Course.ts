import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICourse extends Document {
  name: string;
  description: string;
  duration: string;
  fees: string;
  category: string;
  accent: string;
  imageUrl?: string;
  status: "active" | "inactive";
  deletedAt?: Date;
  // Structured duration (for display + logic)
  durationValue?: number;
  durationUnit?: "week" | "month" | "year";
  // Access expiry for student (after enroll)
  accessValue?: number; // 0 = lifetime
  accessUnit?: "week" | "month" | "year";
  accessDays?: number; // computed, 0 = lifetime
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    fees: { type: String, required: true },
    category: { type: String, required: true },
    accent: { type: String, default: "#1F3354" },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt: { type: Date },
    durationValue: { type: Number, default: null },
    durationUnit: { type: String, enum: ["week", "month", "year"], default: null },
    accessValue: { type: Number, default: 0 },
    accessUnit: { type: String, enum: ["week", "month", "year"], default: "month" },
    accessDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CourseSchema.index({ status: 1 });

export default (mongoose.models.Course as Model<ICourse>) || mongoose.model<ICourse>("Course", CourseSchema);
