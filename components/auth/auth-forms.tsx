"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import {
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  signupAction,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { AuthActionState, AuthField } from "@/lib/auth-validation";
import { initialAuthActionState } from "@/lib/auth-validation";

type AuthAction = (
  previousState: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" loading={pending} loadingLabel={pendingLabel}>
      {label}
    </Button>
  );
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <p
        className="rounded-control border border-danger-strong/30 bg-danger-soft px-3 py-3 text-sm leading-6 text-danger-strong"
        role="alert"
      >
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p
        className="rounded-control border border-success/30 bg-success-soft px-3 py-3 text-sm leading-6 text-success-strong"
        role="status"
      >
        {state.success}
      </p>
    );
  }

  return null;
}

function FieldError({ field, state }: { field: AuthField; state: AuthActionState }) {
  const message = state.fieldErrors?.[field];

  if (!message) {
    return null;
  }

  return (
    <p id={`${field}-error`} className="mt-1 text-sm text-danger-strong">
      {message}
    </p>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {children}
    </label>
  );
}

function TextInput({
  id,
  name,
  type = "text",
  autoComplete,
  required = true,
  state,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  state: AuthActionState;
}) {
  const field = name as AuthField;
  const hasError = Boolean(state.fieldErrors?.[field]);

  return (
    <input
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      aria-invalid={hasError || undefined}
      aria-describedby={hasError ? `${field}-error` : undefined}
      className="mt-2 min-h-11 w-full rounded-control border border-border-default bg-canvas px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-focus focus:ring-2 focus:ring-focus/30"
      {...props}
    />
  );
}

function AuthFormShell({
  action,
  children,
}: {
  action: AuthAction;
  children: (state: AuthActionState) => ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialAuthActionState);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      {children(state)}
    </form>
  );
}

export function LoginForm({ next }: { next: string }) {
  return (
    <AuthFormShell action={loginAction}>
      {(state) => (
        <>
          <input type="hidden" name="next" value={next} />
          <div>
            <FieldLabel htmlFor="login-email">Email address</FieldLabel>
            <TextInput
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              placeholder="you@company.com"
              state={state}
            />
            <FieldError field="email" state={state} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-4">
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-brand-strong underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <TextInput
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              state={state}
            />
            <FieldError field="password" state={state} />
          </div>
          <SubmitButton label="Log in" pendingLabel="Signing in" />
        </>
      )}
    </AuthFormShell>
  );
}

export function SignupForm({ next }: { next: string }) {
  return (
    <AuthFormShell action={signupAction}>
      {(state) => (
        <>
          <input type="hidden" name="next" value={next} />
          <div>
            <FieldLabel htmlFor="signup-name">Your name</FieldLabel>
            <TextInput
              id="signup-name"
              name="fullName"
              autoComplete="name"
              placeholder="Alex Novak"
              state={state}
            />
            <FieldError field="fullName" state={state} />
          </div>
          <div>
            <FieldLabel htmlFor="signup-company">Company name</FieldLabel>
            <TextInput
              id="signup-company"
              name="companyName"
              autoComplete="organization"
              placeholder="Northstar Commerce"
              state={state}
            />
            <FieldError field="companyName" state={state} />
          </div>
          <div>
            <FieldLabel htmlFor="signup-email">Work email</FieldLabel>
            <TextInput
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              placeholder="you@company.com"
              state={state}
            />
            <FieldError field="email" state={state} />
          </div>
          <div>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <TextInput
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              state={state}
            />
            <p className="mt-1 text-xs text-ink-muted">Use at least 8 characters.</p>
            <FieldError field="password" state={state} />
          </div>
          <div>
            <FieldLabel htmlFor="signup-password-confirmation">Confirm password</FieldLabel>
            <TextInput
              id="signup-password-confirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              state={state}
            />
            <FieldError field="passwordConfirmation" state={state} />
          </div>
          <SubmitButton label="Create account" pendingLabel="Creating account" />
          <p className="text-xs leading-5 text-ink-muted">
            By creating an account, you agree to use this workspace for your organization&apos;s delivery operations.
          </p>
        </>
      )}
    </AuthFormShell>
  );
}

export function ForgotPasswordForm() {
  return (
    <AuthFormShell action={forgotPasswordAction}>
      {(state) => (
        <>
          <div>
            <FieldLabel htmlFor="forgot-email">Email address</FieldLabel>
            <TextInput
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              placeholder="you@company.com"
              state={state}
            />
            <FieldError field="email" state={state} />
          </div>
          <SubmitButton label="Send reset link" pendingLabel="Sending link" />
        </>
      )}
    </AuthFormShell>
  );
}

export function ResetPasswordForm() {
  return (
    <AuthFormShell action={resetPasswordAction}>
      {(state) => (
        <>
          <div>
            <FieldLabel htmlFor="reset-password">New password</FieldLabel>
            <TextInput
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              state={state}
            />
            <p className="mt-1 text-xs text-ink-muted">Use at least 8 characters.</p>
            <FieldError field="password" state={state} />
          </div>
          <div>
            <FieldLabel htmlFor="reset-password-confirmation">Confirm new password</FieldLabel>
            <TextInput
              id="reset-password-confirmation"
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              state={state}
            />
            <FieldError field="passwordConfirmation" state={state} />
          </div>
          <SubmitButton label="Update password" pendingLabel="Updating password" />
        </>
      )}
    </AuthFormShell>
  );
}
