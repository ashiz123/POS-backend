import z from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const ProductSchema = z
  .object({
    name: z.string(),
    // barcode: z.string().min(5, 'Barcode must be less than 5 words'),

    description: z.string().optional(),
    price: z.number().positive("Price should be all positive"),
    costPrice: z.number().positive("Cost price should be positive value"),
    isActive: z.boolean().default(true),
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
