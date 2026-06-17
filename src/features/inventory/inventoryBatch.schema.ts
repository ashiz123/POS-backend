import { Schema } from "mongoose";
import { InventoryBatchDocument } from "./inventoryBatch.model";

export const InventoryBatchSchema = new Schema<InventoryBatchDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    expiryDate: { type: Date, nullable: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

InventoryBatchSchema.index(
  { productId: 1, batchNumber: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
InventoryBatchSchema.index({ productId: 1, expiryDate: 1, receivedDate: 1 });
