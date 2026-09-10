import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPageImage extends Document {
  pageKey: string;       // e.g. "home", "about", "courses"
  imageKey: string;      // e.g. "heroBanner", "heroBg", "sideImage"
  label: string;         // Human-readable label shown in admin
  imageUrl: string;      // Uploaded URL or external URL
  updatedAt: Date;
}

const PageImageSchema = new Schema<IPageImage>(
  {
    pageKey:  { type: String, required: true },
    imageKey: { type: String, required: true },
    label:    { type: String, required: true },
    imageUrl: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

// Compound unique index: one record per page+imageKey combo
PageImageSchema.index({ pageKey: 1, imageKey: 1 }, { unique: true });

export default (mongoose.models.PageImage as Model<IPageImage>) ||
  mongoose.model<IPageImage>("PageImage", PageImageSchema);
