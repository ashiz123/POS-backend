import mongoose, { Document, Types } from "mongoose";
import { PaymentSchema } from "./payment.schema";
import { PAYMENT_STATUS, PAYMENT_TYPE } from "./payment.constants";

export type PayType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export interface PaymentType {
  orderId: string;
  stripePaymentId: string;
  type: PayType;
  status: PaymentStatus;
  businessId: string | Types.ObjectId | undefined;
  metaData?: Record<string, string>;
  amount: number;
  currency: string;
}

export interface IPaymentDocument
  extends Omit<PaymentType, "orderId">, Document {
  orderId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentModel = mongoose.model<IPaymentDocument>(
  "Payment",
  PaymentSchema,
);
