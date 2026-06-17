import { Schema } from "mongoose";
import { ICategoryDocument } from "./category.model";

export const CategorySchema = new Schema<ICategoryDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: [true, "Business id is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // image: {
    //   type: String,
    //   default: "https://placehold.co/400x400?text=Product+Image",
    // },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    position: {
      type: Number,
      default: 999,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, id: true },
);

CategorySchema.index({ businessId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ businessId: 1, position: 1 }, { unique: true });
CategorySchema.index({ businessId: 1, title: 1 }, { unique: true });
