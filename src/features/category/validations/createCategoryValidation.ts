import z from "zod";

// Helper for MongoDB ID validation
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const CreateCategorySchema = z
  .object({
    title: z.string().min(1, "Title is required").trim(),
    slug: z.string().slugify().min(3, "Slug is required").trim(),
    description: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().default(true),
    parentCategoryId: objectIdSchema.optional().nullable().default(null),
  })
  .strict();

export type CategoryRequest = z.infer<typeof CreateCategorySchema>;
