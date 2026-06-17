import mongoose, { Document, Types } from "mongoose";
import { OrderSchema } from "./order.schema";
import { FinalResolvedItem } from "./orderItems/orderItem.model";

export interface OrderType {
  _id: string | Types.ObjectId;
  orderId: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: FinalResolvedItem[];
  terminalSessionId?: string | Types.ObjectId;
  creatorId?: string | Types.ObjectId;
  terminalId?: string | Types.ObjectId;
  businessId?: string | Types.ObjectId;
  total: number;
  paidAmount?: number;
}

export interface OrderDocument extends OrderType, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderModel = mongoose.model<OrderDocument>("Order", OrderSchema);
