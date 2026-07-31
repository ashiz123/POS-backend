import { z } from "zod";

export const ResetPasswordValidation = z.object({
  token: z.string().min(6, "token required "),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});
