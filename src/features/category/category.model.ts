import mongoose, { Model, Document, Types } from "mongoose";
import { CategorySchema } from "./category.schema";

export interface ICategory {
  businessId: string | Types.ObjectId;
  title: string;
  description?: string;
  isActive: boolean;
  slug: string;
  // image: string;
  position?: number;
  parentCategoryId?: string | Types.ObjectId | null;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateCategoryDTO = Omit<ICategory, "createdAt" | "updatedAt">;
export type UpdateCategoryDTO = Partial<Omit<CreateCategoryDTO, "businessId">>;

export interface ICategoryDocument
  extends Omit<ICategory, "businessId" | "parentCategoryId">, Document {
  _id: Types.ObjectId;
  businessId: Types.ObjectId;
  parentCategoryId?: Types.ObjectId | null;
}

export const CategoryModel: Model<ICategoryDocument> =
  mongoose.model<ICategoryDocument>("Category", CategorySchema);
