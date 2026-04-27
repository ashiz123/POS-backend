import { z } from "zod";

const USER_ROLES = [
  "admin",
  "manager",
  "cashier",
  "employee",
  "owner",
] as const;

const PHONE_PATTERN = z.string().regex(/^\+?[1-9]\d{1,14}$/, {
  message: "Invalid phone number format",
});

// const objectIdSchema = z
//     .string()
//     .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')

const userValidation = z
  .object({
    name: z.string().min(5).max(100),
    email: z.email().toLowerCase(),
    address: z.string(),
    phone: PHONE_PATTERN,
    password: z.string().optional(),
  })
  .strict();

export const CreateUserValidation = userValidation.extend({
  role: z.enum(USER_ROLES),
});

export const UpdateUserValidation = CreateUserValidation.partial();

export type UserRequest = z.infer<typeof CreateUserValidation>;
export type UpdateUserRequest = z.infer<typeof UpdateUserValidation>;
