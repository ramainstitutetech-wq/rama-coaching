import mongoose, { Document, Schema, Model } from "mongoose";

export interface IMockTestAttempt extends Document {
  mockTestId: mongoose.Types.ObjectId;
  mockTestTitle: string;
  studentName: string;
  rollNumber?: string;
  isRamaStudent: boolean;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  passed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function calcGrade(percentage: number): string {
  if (percentage >= 90) return "S";
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 35) return "D";
  return "F";
}

const MockTestAttemptSchema = new Schema<IMockTestAttempt>(
  {
    mockTestId: { type: Schema.Types.ObjectId, ref: "MockTest", required: true, index: true },
    mockTestTitle: { type: String, default: "" },
    studentName: { type: String, required: true },
    rollNumber: { type: String, default: "" },
    isRamaStudent: { type: Boolean, default: false },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    attempted: { type: Number, required: true },
    correct: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

MockTestAttemptSchema.index({ mockTestId: 1, percentage: -1, score: -1, createdAt: -1 });

export function getGradeForPercentage(p: number) {
  return calcGrade(p);
}

export default (mongoose.models.MockTestAttempt as Model<IMockTestAttempt>) ||
  mongoose.model<IMockTestAttempt>("MockTestAttempt", MockTestAttemptSchema);
