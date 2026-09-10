import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
  avatarUrl?: string;
  lastLoginAt?: Date;
  deletedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // OTP for email/password change verification (sent to current email)
  otpHash?: string;
  otpExpires?: Date;
  otpPurpose?: "email_change" | "password_change";
  pendingEmail?: string; // for email change - new email waiting verification
  pendingPasswordHash?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    avatarUrl: { type: String },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    otpHash: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpPurpose: { type: String, enum: ["email_change", "password_change"], default: null },
    pendingEmail: { type: String, default: null },
    pendingPasswordHash: { type: String, default: null },
  },
  { timestamps: true }
);

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);