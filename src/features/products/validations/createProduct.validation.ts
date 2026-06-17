import z from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const ProductSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    categoryId: z.string(),
    slug: z.string().slugify().min(3, "Slug is too short"),
    sellPrice: z.number().min(1, "Sell price is required"),
    stockType: z.enum(["stocked", "composite"]),
    lowStock: z.number().optional(),
    isActive: z.boolean().default(true),
    // price: z.number().positive("Price should be all positive"),
    // costPrice: z.number().positive("Cost price should be positive value"),
  })
  .strict();

export const CreateProductSchema = ProductSchema.extend({
  categoryId: objectIdSchema,
});

export const UpdateProductSchema = CreateProductSchema.partial()
  .strict()
  .extend({
    //its for default value, if default value get data the validation wont work. so made them optional
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type ProductRequest = z.infer<typeof CreateProductSchema>;
export type ProductUpdate = z.infer<typeof UpdateProductSchema>;
