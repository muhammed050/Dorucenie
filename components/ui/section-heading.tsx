import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-ink-soft">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
