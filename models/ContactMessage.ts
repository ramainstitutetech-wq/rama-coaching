import mongoose, { Document, Schema, Model } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "read" | "unread";
  date: Date;
  deletedAt?: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["read", "unread"], default: "unread" },
    date: { type: Date, default: Date.now },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1 });
ContactMessageSchema.index({ createdAt: 1 });

export default (mongoose.models.ContactMessage as Model<IContactMessage>) || mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
