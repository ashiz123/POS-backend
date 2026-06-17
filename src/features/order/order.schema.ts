import { Schema } from "mongoose";
import { OrderDocument } from "./order.model";
import { OrderItemSchema } from "./orderItems/orderItem.schema";

export const OrderSchema = new Schema<OrderDocument>({
  orderId: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  items: { type: [OrderItemSchema], required: true },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  paidAmount: {
    type: Number,
    required: false,
    min: 0,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  terminalSessionId: {
    type: Schema.Types.ObjectId,
    ref: "SessionTerminal",
    required: true,
  },
  terminalId: {
    type: Schema.Types.ObjectId,
    ref: "Terminal",
    required: true,
  },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
