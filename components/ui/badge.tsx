import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "info" | "success" | "warning";

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: "border-border-default bg-surface-muted text-ink-soft",
  info: "border-brand/30 bg-brand-soft text-brand-strong",
  success: "border-success/30 bg-success-soft text-success-strong",
  warning: "border-warning/30 bg-warning-soft text-warning-strong",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children: ReactNode;
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
