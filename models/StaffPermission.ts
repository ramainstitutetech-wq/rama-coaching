import mongoose, { Document, Schema, Model } from "mongoose";
import { STAFF_PAGES, type StaffPage, type IPagePermission } from "@/lib/staff-pages";

// Re-export so existing imports from this model still work
export { STAFF_PAGES, type StaffPage, type IPagePermission };

export interface IStaffPermission extends Document {
  staffId: mongoose.Types.ObjectId;
  permissions: IPagePermission[];
  updatedAt: Date;
}

const PagePermissionSchema = new Schema<IPagePermission>(
  {
    page:   { type: String, enum: STAFF_PAGES, required: true },
    read:   { type: Boolean, default: false },
    write:  { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const StaffPermissionSchema = new Schema<IStaffPermission>(
  {
    staffId:     { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    permissions: { type: [PagePermissionSchema], default: [] },
  },
  { timestamps: true }
);

export default (mongoose.models.StaffPermission as Model<IStaffPermission>) ||
  mongoose.model<IStaffPermission>("StaffPermission", StaffPermissionSchema);
