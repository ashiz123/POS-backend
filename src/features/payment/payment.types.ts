import { IPaymentDocument, PaymentType } from "./payment.model";
import { PAYMENT_STATUS } from "./payment.constants";
import { ClientSession } from "mongoose";
import { RouteHandler } from "../../shared/baseType";

// export interface IPaymentController {
//   createPayment(payment: PaymentType): Promise<PaymentType>;
//   getPaymentById(id: string): Promise<PaymentType>;
//   updatePayment(id: string, payment: PaymentType): Promise<PaymentType>;
//   deletePayment(id: string): Promise<void>;
// }

export interface IPaymentRepository {
  create(data: PaymentType, session: ClientSession): Promise<IPaymentDocument>;
  // findById(paymentId: string): Promise<PaymentType | null>
  // findByOrderId(orderId: string): Promise<PaymentType | null>
  // updateStatus(paymentId: string, status: PaymentStatus): Promise<PaymentType>
  // delete(paymentId: string): Promise<void>
}

export interface IPaymentService {
  createPayment(
    data: PaymentType,
    session: ClientSession,
  ): Promise<IPaymentDocument>;
}

export interface IPaymentController {
  transactions: RouteHandler;
}

// getPaymentByOrder(orderId: string): Promise<PaymentType>
// updatePaymentStatus(
//     orderId: string,
//     status: PaymentStatus
// ): Promise<PaymentType>
// refundPayment(orderId: string, amount?: number): Promise<PaymentType>

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
