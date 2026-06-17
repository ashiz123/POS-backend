import mongoose, { Document, Types } from "mongoose";
import { OrderItemSchema } from "./orderItem.schema";

export interface FinalResolvedItem {
  productId: string;
  sku: string;
  price: number;
  quantity: number;
  allocations: BatchAllocationType[]; // Using the BatchAllocation interface we made earlier
}

export type RequestOrderItemType = Omit<FinalResolvedItem, "allocations">;

export interface OrderItemDocument
  extends Omit<FinalResolvedItem, "productId" | "batchId">, Document {
  productId: Types.ObjectId;
  batchId: Types.ObjectId;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchAllocationType {
  batchId: string | Types.ObjectId;
  quantity: number;
}

export const OrderItemModel = mongoose.model<OrderItemDocument>(
  "OrderItem",
  OrderItemSchema,
);
