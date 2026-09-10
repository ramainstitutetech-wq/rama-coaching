import mongoose, { Document, Schema, Model } from "mongoose";
import { COURSE_CATEGORIES, type CourseCategory } from "./MockTest";

export type ENoteAccessType = "free" | "enrolled";

export interface IENote extends Document {
  title: string;
  description: string;
  courseCategory: CourseCategory;
  accessType: ENoteAccessType;
  imageUrl?: string;
  fileUrl?: string;
  content?: string;
  order: number;
  status: "active" | "inactive";
  deletedAt?: Date;
}

const ENoteSchema = new Schema<IENote>(
  {
    title:          { type: String, required: true },
    description:    { type: String, required: true },
    courseCategory: { type: String, enum: COURSE_CATEGORIES, required: true },
    accessType:     { type: String, enum: ["free", "enrolled"], default: "enrolled" },
    imageUrl:       { type: String, default: "" },
    fileUrl:        { type: String, default: "" },
    content:        { type: String, default: "" },
    order:          { type: Number, default: 0 },
    status:         { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt:      { type: Date },
  },
  { timestamps: true }
);

ENoteSchema.index({ courseCategory: 1, status: 1 });

export default (mongoose.models.ENote as Model<IENote>) ||
  mongoose.model<IENote>("ENote", ENoteSchema);
