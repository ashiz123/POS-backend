//implement mongose
import mongoose, { Document, Model, Types } from "mongoose";
import { businessSchema } from "./business.schema";
import { BusinessProps } from "../business.model";

//Business persistance model

export interface IBusinessDocument extends BusinessProps, Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

//Database Model
export const BusinessModel: Model<IBusinessDocument> =
  mongoose.model<IBusinessDocument>("Business", businessSchema);
