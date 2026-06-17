import { Schema } from "mongoose";
import { IProductDocument } from "./product.model";

export const ProductSchema: Schema<IProductDocument> = new Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    sellPrice: {
      type: Number,
      required: true,
      trim: true,
    },
    lowStock: {
      type: Number,
      required: false,
      trim: false,
      default: null,
    },
    stockType: {
      type: String,
      enum: ["stocked", "composite"],
      default: "stocked",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, id: true },
);

ProductSchema.index({ businessId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ businessId: 1, name: 1 }, { unique: true });
