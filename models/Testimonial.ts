import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITestimonial extends Document {
  studentName: string;
  course: string;
  review: string;
  rating: number;
  avatarColor: string;
  published: boolean;
  deletedAt?: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    avatarColor: { type: String, default: "#1F3354" },
    published: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

TestimonialSchema.index({ published: 1 });

export default (mongoose.models.Testimonial as Model<ITestimonial>) || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
