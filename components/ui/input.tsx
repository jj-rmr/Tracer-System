import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function inputLayoutClasses(className?: string) {
  if (!className) return undefined;

  return className
    .split(/\s+/)
    .filter(Boolean)
    .filter(
      (token) =>
        !/^(?:bg-|border(?:-|$)|rounded(?:-|$)|shadow(?:-|$)|ring(?:-|$)|outline(?:-|$)|px-|py-|p-|text-(?:slate|sky|rose|red|white|black)-|placeholder:|hover:|focus:|focus-within:|focus-visible:|disabled:|aria-)/.test(
          token,
        ),
    )
    .join(" ");
}

function Input({
  className,
  type,
  "aria-invalid": ariaInvalid,
  ...props
}: React.ComponentProps<"input">) {
  const isChoiceInput = type === "checkbox" || type === "radio";
  const inferredInvalid = Boolean(className && /(?:rose|red)-/.test(className));

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      aria-invalid={ariaInvalid ?? (inferredInvalid || undefined)}
      className={cn(
        !isChoiceInput &&
          "h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3.5 py-2 text-base text-foreground inset-shadow-sm transition-[color,background-color,border-color,box-shadow] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground hover:border-ring/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:inset-shadow-none disabled:opacity-60 aria-invalid:border-destructive aria-invalid:bg-destructive/5 aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        isChoiceInput ? className : inputLayoutClasses(className),
      )}
      {...props}
    />
  );
}

export { Input };
