import z from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const ProductSchema = z
  .object({
    // 1. Name (Required String)
    name: z
      .string({ message: "Product name is required" })
      .trim()
      .min(1, "Product name cannot be empty"),

    // 2. Description (Optional String: converts empty string "" from FormData to undefined)
    description: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string({ message: "Description must be text" }).optional(),
    ),

    // 3. Category ID (Required ObjectId String)
    categoryId: objectIdSchema,

    // 4. Slug (Replaces invalid .slugify() with regex)
    slug: z.string().slugify().min(3, "Slug is too short"),
    // .regex(
    //   /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    //   "Slug must contain only lowercase letters, numbers, and hyphens (e.g. womens-coat)",
    // ),

    // 5. Sell Price (Required Number: handles string "23" from FormData -> 23)
    sellPrice: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = Number(val);
        return isNaN(parsed) ? val : parsed;
      },
      z
        .number({
          message: "Sell price is required and must be a valid number",
        })
        .min(1, "Sell price must be at least 1"),
    ),

    // 6. Stock Type (Enum: "stocked" | "composite")
    stockType: z.enum(["stocked", "composite"], {
      message: "Stock type must be either 'stocked' or 'composite'",
    }),

    // 7. Low Stock (Optional Number: converts string "5" -> 5 and empty string "" -> undefined)
    lowStock: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z
        .number({ message: "Low stock must be a valid number" })
        .min(0, "Low stock cannot be negative")
        .optional(),
    ),

    // 8. Image URL (Optional String)
    imageUrl: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string({ message: "Image URL must be a string" }).optional(),
    ),

    image: z.any().optional(),

    // 9. Is Active (Boolean: handles string "true"/"false" from FormData -> boolean true/false)
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
  })
  .strict();

export const CreateProductSchema = ProductSchema.extend({
  categoryId: objectIdSchema,
});

export const UpdateProductSchema = CreateProductSchema.partial()
  .strict()
  .extend({
    //its for default value, if default value get data the validation wont work. so made them optional
    isActive: z.preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return val;
    }, z.boolean().optional()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type ProductRequest = z.infer<typeof CreateProductSchema>;
export type ProductUpdate = z.infer<typeof UpdateProductSchema>;
