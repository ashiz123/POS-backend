import { z } from "zod";

export const BusinessSchemaValidation = z
  .object({
    name: z.string(),
    address: z.string(),
    // Optional fields
    website: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    businessType: z.string(),
  })
  .strict();

export type BusinessRequest = z.infer<typeof BusinessSchemaValidation>;
