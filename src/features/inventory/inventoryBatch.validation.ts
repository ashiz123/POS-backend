import { z } from "zod/v3";

export const inventoryBatchSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string(),
  quantity: z.number().min(0),
  price: z.number().min(0),
  expiryDate: z.coerce.date().min(new Date()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

export const CreateInventoryBatchSchema = inventoryBatchSchema.omit({
  productId: true,
  batchNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateInventoryBatchSchema = inventoryBatchSchema
  .omit({ createdAt: true, updatedAt: true })
  .partial();
