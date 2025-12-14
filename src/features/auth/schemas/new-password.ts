import { z } from "zod";

export const NewPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "Please enter your password, required",
    }),
    passwordConfirmation: z.string().min(6, {
      message: "Please confirm your password, required.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });
