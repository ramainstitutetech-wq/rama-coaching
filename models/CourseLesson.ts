import mongoose, { Document, Schema, Model } from "mongoose";

export type LessonType = "video_youtube" | "video_drive" | "pdf" | "ppt" | "text" | "image";

export interface ICourseLesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  type: LessonType;
  // For youtube/drive: store original URL, also derived embedUrl
  fileUrl?: string; // for pdf/ppt/image/video_drive/youtube original
  content?: string; // for text (HTML/rich)
  thumbnailUrl?: string;
  duration?: string; // e.g. "12 min"
  order: number;
  status: "published" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const CourseLessonSchema = new Schema<ICourseLesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["video_youtube", "video_drive", "pdf", "ppt", "text", "image"], required: true },
    fileUrl: { type: String, default: "" },
    content: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    duration: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
  },
  { timestamps: true }
);

CourseLessonSchema.index({ courseId: 1, order: 1 });
CourseLessonSchema.index({ status: 1 });

export default (mongoose.models.CourseLesson as Model<ICourseLesson>) || mongoose.model<ICourseLesson>("CourseLesson", CourseLessonSchema);
