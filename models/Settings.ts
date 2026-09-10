import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISettings extends Document {
  instituteName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  footerText?: string;
  secretarySignatureUrl?: string;
  controllerSignatureUrl?: string;
  stampUrl?: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    instituteName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    youtube: { type: String },
    linkedin: { type: String },
    footerText: { type: String },
    secretarySignatureUrl: { type: String, default: "" },
    controllerSignatureUrl: { type: String, default: "" },
    stampUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default (mongoose.models.Settings as Model<ISettings>) || mongoose.model<ISettings>("Settings", SettingsSchema);
