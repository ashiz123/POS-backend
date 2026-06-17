import { Schema } from "mongoose";
import { BatchAllocationType, OrderItemDocument } from "./orderItem.model";

const BatchAllocationSchema = new Schema<BatchAllocationType>({
  batchId: {
    type: Schema.Types.ObjectId,
    ref: "InventoryBatch",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
});

export const OrderItemSchema = new Schema<OrderItemDocument>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  allocations: {
    type: [BatchAllocationSchema],
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});
