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
    isActive: z
      .preprocess(
        (val) => {
          if (val === "true" || val === true) return true;
          if (val === "false" || val === false) return false;
          return val;
        },
        z.boolean({ message: "isActive must be a boolean (true or false)" }),
      )
      .default(true),
    imageUrl: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string({ message: "Image URL must be a string" }).optional(),
    ),
    parentCategoryId: objectIdSchema.optional().nullable().default(null),
  })
  .strict();

export type CategoryRequest = z.infer<typeof CreateCategorySchema>;
