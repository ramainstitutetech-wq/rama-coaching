import mongoose, { Document, Schema, Model } from "mongoose";

// Canonical course categories used across the app
export const COURSE_CATEGORIES = [
  "General",
  "O-Level",
  "CCC",
  "CCC+",
  "ADCA",
  "DCA",
  "Tally",
  "Digital Marketing",
  "RSCIT",
  "Other",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface IQuestion {
  _id?: mongoose.Types.ObjectId;
  questionText: string;
  questionTextHi?: string;
  options: string[];
  optionsHi?: string[];
  correctOption: number;
  explanation?: string;
  explanationHi?: string;
  marks: number;
}

export interface IMockTest extends Document {
  title: string;
  description: string;
  subject: string;
  courseCategory: CourseCategory;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: IQuestion[];
  status: "active" | "inactive";
  attemptLimit: number;
  isFree: boolean;          // free trial for Buy Now page
  deletedAt?: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText:   { type: String, required: true },
  questionTextHi: { type: String, default: "" },
  options: {
    type: [String], required: true,
    validate: { validator: (v: string[]) => v.length === 4, message: "4 options required" },
  },
  optionsHi:     { type: [String], default: [] },
  correctOption: { type: Number, required: true, min: 0, max: 3 },
  explanation:   { type: String, default: "" },
  explanationHi: { type: String, default: "" },
  marks:         { type: Number, required: true, default: 1 },
});

const MockTestSchema = new Schema<IMockTest>(
  {
    title:          { type: String, required: true },
    description:    { type: String, required: true },
    subject:        { type: String, required: true },
    courseCategory: { type: String, enum: COURSE_CATEGORIES, default: "General" },
    duration:       { type: Number, required: true, default: 30 },
    totalMarks:     { type: Number, required: true, default: 10 },
    passingMarks:   { type: Number, required: true, default: 5 },
    questions:      { type: [QuestionSchema], default: [] },
    status:         { type: String, enum: ["active", "inactive"], default: "active" },
    attemptLimit:   { type: Number, default: 10 },
    isFree:         { type: Boolean, default: true },
    deletedAt:      { type: Date },
  },
  { timestamps: true }
);

MockTestSchema.index({ status: 1 });
MockTestSchema.index({ courseCategory: 1 });

export default (mongoose.models.MockTest as Model<IMockTest>) ||
  mongoose.model<IMockTest>("MockTest", MockTestSchema);
