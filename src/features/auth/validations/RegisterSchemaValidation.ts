import { z } from "zod";

export const RegisterSchemaValidation = z
  .object({
    name: z.string().min(2).max(80),
    email: z.email().toLowerCase(),
    phone: z.string().min(7).max(20),
    password: z.string().min(8).max(128),
  })
  .strict();
