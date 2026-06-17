import Stripe from "stripe";

export type StripePaymentData = {
  amount: number;
  currency: string;
  orderId: string;
  businessId: string;
};

export type StripePaymentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded";

export interface IPaymentIntentDTO {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: StripePaymentStatus;
  metadata: {
    orderId: string;
    businessId: string;
  };
  receipt_url?: string;
}

export type PaymentIntentProcess = {
  amount: number;
  currency: string;
  paymentType: string;
};

export interface IStripePaymentService {
  createPaymentIntent(
    stripeTerminalData: StripePaymentData,
  ): Promise<IPaymentIntentDTO>;
  retrievePaymentData(paymentIntent: string): Promise<PaymentIntentProcess>;
  // paymentSuccess(charge: Stripe.Charge): Promise<void>
}

export interface ChargePaymentDTO {
  orderId: string;
  businessId: string;
  type: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  card_brand: string;
  last4: string;
  receiptUrl: string;
  status: string;
}
