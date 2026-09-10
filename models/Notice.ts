import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotice extends Document {
  title: string;
  description: string;
  date: Date;
  priority: "low" | "normal" | "high";
  published: boolean;
  deletedAt?: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal", required: true },
    published: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

NoticeSchema.index({ published: 1 });
NoticeSchema.index({ priority: 1 });
NoticeSchema.index({ date: 1 });

export default (mongoose.models.Notice as Model<INotice>) || mongoose.model<INotice>("Notice", NoticeSchema);
