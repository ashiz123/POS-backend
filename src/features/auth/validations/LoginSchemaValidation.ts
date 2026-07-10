import { z } from "zod";
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const LoginSchemaValidation = z
  .object({
    email: z.email().toLowerCase(),
    password: z.string().min(8).max(128),
  })
  .strict();

export const LoginWithBusinessValidation = z
  .object({
    businessId: objectIdSchema,
  })
  .strict();
