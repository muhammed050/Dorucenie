import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(320, "Email address is too long.");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(160, "This field must be 160 characters or fewer.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirm your password."),
    fullName: nameSchema,
    companyName: nameSchema,
    next: z.string().optional(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match.",
  });

export type AuthField =
  | "email"
  | "password"
  | "passwordConfirmation"
  | "fullName"
  | "companyName";

export type AuthActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
};

export const initialAuthActionState: AuthActionState = {};

export function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validationState(error: z.ZodError): AuthActionState {
  const fieldErrors: Partial<Record<AuthField, string>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      field in {
        email: true,
        password: true,
        passwordConfirmation: true,
        fullName: true,
        companyName: true,
      } &&
      !fieldErrors[field as AuthField]
    ) {
      fieldErrors[field as AuthField] = issue.message;
    }
  }

  return {
    error: "Check the highlighted fields and try again.",
    fieldErrors,
  };
}
