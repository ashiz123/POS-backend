import { Schema } from "mongoose";
import { IBusinessDocument } from "./business_db_model";

export const businessSchema = new Schema<IBusinessDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trime: true,
      required: false,
    },

    businessType: {
      type: String,
      trim: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      required: true,
      default: "pending",
    },

    activationToken: {
      type: String,
      trim: true,
      required: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
