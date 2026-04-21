import z from "zod";
import { CreateCategorySchema } from "./createCategoryValidation";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const UpdateCategorySchema = CreateCategorySchema.partial() //make optional every field
  .strict() //unknown fields
  .extend({
    isActive: z.boolean().optional(),
    parentCategoryId: objectIdSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
