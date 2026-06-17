import mongoose, { Document, Model, Types } from "mongoose";
import { ProductSchema } from "./product.schema";

interface ProductBase {
  name: string;
  description?: string;
  slug: string;
  stockType: "stocked" | "composite";
  isActive: boolean;
  lowStock?: number;
  sellPrice: number;
  deletedAt?: Date | null;
}

export interface IProduct extends ProductBase {
  sku: string;
}

export interface CreateProductDTO extends ProductBase {
  sku: string;
  categoryId: string;
  businessId: string;
}

export type UpdateProductDTO = Partial<ProductBase>;

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  businessId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductModel: Model<IProductDocument> =
  mongoose.model<IProductDocument>("Product", ProductSchema);
