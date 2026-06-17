import { Schema } from "mongoose";
import { TERMINAL_PAYMENT_STATUS, TERMINAL_STATUS } from "./terminal.constant";
import { TerminalDocument } from "./terminal.model";

export const terminalSchema = new Schema<TerminalDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    businessId: { type: Schema.Types.ObjectId, ref: "Business" },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: TERMINAL_STATUS,
      default: TERMINAL_STATUS.REQUESTED,
    },

    paymentStatus: {
      type: String,
      enum: TERMINAL_PAYMENT_STATUS,
      default: TERMINAL_PAYMENT_STATUS.PENDING,
    },

    activationCode: { type: String, default: null },
    activationStatus: { type: Boolean, default: false },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: String, default: null, required: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

terminalSchema.index({ businessId: 1, name: 1 }, { unique: true });
