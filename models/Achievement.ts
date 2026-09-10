import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAchievement extends Document {
  value: string;
  label: string;
  description?: string;
  icon: string;
  status: "active" | "inactive";
  ordering: number;
  deletedAt?: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: "Star", required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    ordering: { type: Number, default: 0 },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

AchievementSchema.index({ status: 1 });
AchievementSchema.index({ ordering: 1 });

export default (mongoose.models.Achievement as Model<IAchievement>) || mongoose.model<IAchievement>("Achievement", AchievementSchema);
