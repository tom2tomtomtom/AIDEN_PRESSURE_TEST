import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary shadow-[4px_4px_0px_hsl(0_100%_50%)] hover:shadow-[6px_6px_0px_hsl(0_100%_50%)] hover:translate-x-[-2px] hover:translate-y-[-2px]",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-transparent hover:text-destructive",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground shadow-[4px_4px_0px_hsl(0_100%_50%)] hover:shadow-[2px_2px_0px_hsl(0_100%_50%)] hover:translate-x-[2px] hover:translate-y-[2px]",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border hover:border-primary hover:text-primary",
        ghost: "hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary",
        link: "text-primary underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
