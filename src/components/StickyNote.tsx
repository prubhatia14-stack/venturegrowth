import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "yellow" | "pink" | "blue" | "green";

export function StickyNote({
  variant = "yellow",
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky-note rounded-sm p-6 font-hand text-xl leading-snug text-foreground",
        variant !== "yellow" && variant,
        className,
      )}
    >
      {children}
    </div>
  );
}
