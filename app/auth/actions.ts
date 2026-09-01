"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  formValue,
  type AuthActionState,
  initialAuthActionState,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  validationState,
} from "@/lib/auth-validation";
import { getSafeRedirectPath, getApplicationUrl } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

function actionError(message: string): AuthActionState {
  return { error: message };
}

function isInvalidLoginError(error: { message?: string }) {
  return error.message?.toLowerCase().includes("invalid login credentials") ?? false;
}

function isUnconfirmedEmailError(error: { message?: string }) {
  return error.message?.toLowerCase().includes("email not confirmed") ?? false;
}

function isConfiguredError(error: unknown) {
  return error instanceof Error && /not configured|must use http/i.test(error.message);
}

function authServiceError(error: unknown, fallback: string) {
  if (isConfiguredError(error)) {
    return actionError(
      "Authentication is not configured yet. Add the Supabase environment variables and try again.",
    );
  }

  return actionError(fallback);
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = loginSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    next: formValue(formData, "next") || undefined,
  });

  if (!result.success) {
    return validationState(result.error);
  }

  const next = getSafeRedirectPath(result.data.next);
  let error: { message?: string } | null = null;

  try {
    const supabase = await createClient();
    ({ error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    }));
  } catch (caughtError) {
    return authServiceError(caughtError, "We couldn't sign you in. Please try again.");
  }

  if (error) {
    return actionError(
      isInvalidLoginError(error)
        ? "Email or password is incorrect."
        : isUnconfirmedEmailError(error)
          ? "Verify your email address before logging in."
        : "We couldn't sign you in. Please try again.",
    );
  }

  redirect(next);
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = signupSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    passwordConfirmation: formValue(formData, "passwordConfirmation"),
    fullName: formValue(formData, "fullName"),
    companyName: formValue(formData, "companyName"),
    next: formValue(formData, "next") || undefined,
  });

  if (!result.success) {
    return validationState(result.error);
  }

  const next = getSafeRedirectPath(result.data.next);
  let data: { session: unknown } | null = null;
  let error: { message?: string } | null = null;

  try {
    const supabase = await createClient();
    const callbackUrl = new URL("/auth/callback", getApplicationUrl());
    callbackUrl.searchParams.set("next", next);

    ({ data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
          company_name: result.data.companyName,
        },
        emailRedirectTo: callbackUrl.toString(),
      },
    }));
  } catch (caughtError) {
    return authServiceError(caughtError, "We couldn't create your account. Please try again.");
  }

  if (error) {
    return actionError("We couldn't create your account. Please try again.");
  }

  if (data?.session) {
    redirect(next);
  }

  redirect("/login?success=check-email");
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = forgotPasswordSchema.safeParse({
    email: formValue(formData, "email"),
  });

  if (!result.success) {
    return validationState(result.error);
  }

  let error: { message?: string } | null = null;

  try {
    const supabase = await createClient();
    const callbackUrl = new URL("/auth/callback", getApplicationUrl());
    callbackUrl.searchParams.set("next", "/reset-password");

    ({ error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: callbackUrl.toString(),
    }));
  } catch (caughtError) {
    return authServiceError(
      caughtError,
      "We couldn't send a reset email right now. Please try again.",
    );
  }

  if (error) {
    return actionError("We couldn't send a reset email right now. Please try again.");
  }

  return {
    ...initialAuthActionState,
    success: "If an account exists for that email, you'll receive a reset link shortly.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = resetPasswordSchema.safeParse({
    password: formValue(formData, "password"),
    passwordConfirmation: formValue(formData, "passwordConfirmation"),
  });

  if (!result.success) {
    return validationState(result.error);
  }

  let userError: { message?: string } | null = null;
  let updateError: { message?: string } | null = null;
  let signOutError: { message?: string } | null = null;

  try {
    const supabase = await createClient();
    const userResult = await supabase.auth.getUser();
    userError = userResult.error;

    if (!userError && !userResult.data.user) {
      return actionError("This password reset link is invalid or has expired.");
    }

    if (!userError) {
      ({ error: updateError } = await supabase.auth.updateUser({
        password: result.data.password,
      }));
    }

    if (!updateError) {
      ({ error: signOutError } = await supabase.auth.signOut());
    }
  } catch (caughtError) {
    return authServiceError(
      caughtError,
      "We couldn't reset your password. Request a new link and try again.",
    );
  }

  if (userError || updateError) {
    return actionError("This password reset link is invalid or has expired.");
  }

  if (signOutError) {
    return actionError("Your password changed, but we couldn't finish signing you out. Try again.");
  }

  redirect("/login?success=password-updated");
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      redirect("/login?error=logout");
    }
  } catch {
    redirect("/login?error=logout");
  }

  redirect("/login?success=signed-out");
}
