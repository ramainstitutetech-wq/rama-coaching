import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBanner extends Document {
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  accent: string;
  active: boolean;
  ordering: number;
  deletedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    heading: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, required: true },
    buttonLink: { type: String, required: true },
    accent: { type: String, default: "#b91c1c" },
    active: { type: Boolean, default: true },
    ordering: { type: Number, default: 0 },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

BannerSchema.index({ active: 1 });
BannerSchema.index({ ordering: 1 });

export default (mongoose.models.Banner as Model<IBanner>) || mongoose.model<IBanner>("Banner", BannerSchema);
