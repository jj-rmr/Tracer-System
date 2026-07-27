import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex max-w-full shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-center text-sm font-semibold! whitespace-normal transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        elevated:
          "bg-primary text-primary-foreground shadow-md  hover:bg-primary/85 hover:shadow-lg",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        "outline-elevated":
          "border-border bg-background shadow-sm hover:bg-muted hover:text-foreground hover:shadow-md aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/85 focus-visible:border-success focus-visible:ring-success/30",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        plain: "bg-transparent text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
        inverse:
          "bg-transparent text-primary-foreground hover:bg-primary-foreground/10 focus-visible:border-primary-foreground/50 focus-visible:ring-primary-foreground/40",
        navigation:
          "text-muted-foreground hover:bg-muted hover:text-foreground active:not-aria-[haspopup]:translate-y-0 active:scale-[0.98]",
        "navigation-active":
          "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary active:not-aria-[haspopup]:translate-y-0 active:scale-[0.98]",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-8 gap-1.5 rounded-lg px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-lg px-3.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4.5 has-data-[icon=inline-start]:pl-4.5",
        icon: "size-10",
        "icon-xs":
          "size-8 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-lg in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
        menu: "h-10 w-full justify-start gap-2 px-4 text-left",
        sidebar: "h-10 w-full justify-start gap-0 px-4",
        "mobile-nav": "h-auto flex-1 flex-col gap-0 p-2",
        accordion: "h-auto min-h-11 w-full justify-between px-5 py-3 text-left",
        wide: "h-12 w-full gap-3 px-5",
        fill: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 flex-1",
        inline: "h-auto gap-1 p-0 text-xs",
        option: "h-11 w-full justify-start px-5",
        "theme-menu": "min-h-14 w-full justify-start gap-3 px-4",
        "theme-floating": "h-11 gap-3 px-4",
        combobox: "h-11 w-full min-w-0 justify-between px-4 text-left",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

type ButtonProps = Omit<ButtonPrimitive.Props, "className"> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
