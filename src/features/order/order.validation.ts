import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const OrderItemValidation = {
  productId: objectIdSchema,
  sku: z.string(),
  quantity: z
    .number()
    .min(1, "Quantity must be greater than 0")
    .max(25, "Quantity must be less than or equal to 25"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
};

export const OrderCreateValidation = z.object({
  items: z
    .array(z.object(OrderItemValidation))
    .min(1, "At least one item is required"),
});
