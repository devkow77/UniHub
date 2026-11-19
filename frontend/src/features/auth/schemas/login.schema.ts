import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Podaj adres e-mail")
    .pipe(z.email("Podaj poprawny adres e-mail")),

  password: z.string().min(1, "Podaj hasło"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
