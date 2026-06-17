import { Document, model, Types } from "mongoose";
import { InventoryBatchSchema } from "./inventoryBatch.schema";

export interface InventoryBatchBase {
  _id: string | Types.ObjectId;
  batchNumber: string;
  quantity: number;
  price: number;
  expiryDate: Date;
  deletedAt?: Date;
}

export interface InventoryBatchDocument extends InventoryBatchBase, Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryBatchDTO extends Omit<
  InventoryBatchBase,
  "_id"
> {
  productId: string;
}

export type InventoryBatchResponse = Omit<InventoryBatchBase, "_id"> & {
  id: string; // Switches the key name to clean 'id'
};

export type UpdateInventoryBatchDTO = Partial<InventoryBatchBase>;

export const InventoryBatchModel = model<InventoryBatchDocument>(
  "InventoryBatch",
  InventoryBatchSchema,
);
