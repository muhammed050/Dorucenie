import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-control border font-medium leading-none transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border-brand bg-brand text-on-brand shadow-button hover:border-brand-strong hover:bg-brand-strong active:bg-brand-strong",
  secondary:
    "border-border-default bg-surface text-ink hover:border-brand hover:bg-brand-soft active:bg-brand-soft",
  ghost:
    "border-transparent bg-transparent text-ink-soft hover:bg-surface-muted hover:text-ink active:bg-surface-muted",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 text-xs",
  md: "px-4 text-sm",
  lg: "px-5 text-sm",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
    loadingLabel?: string;
    children: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      className,
      loading = false,
      loadingLabel = "Loading",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles({ variant, size, className })}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            <span>{loadingLabel}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

export type ButtonLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  keyof ButtonStyleOptions
> &
  ButtonStyleOptions & {
    children: ReactNode;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
