import z from "zod";
import { PAYMENT_TYPE, PAYMENT_STATUS } from "./payment.constants";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const PaymentValidationSchema = z.object({
  orderId: objectIdSchema,
  stripePaymentId: z
    .string()
    .startsWith("pi_", "Must be valid paymentIntent Id"),
});

export type PaymentInputType = z.infer<typeof PaymentValidationSchema>;
