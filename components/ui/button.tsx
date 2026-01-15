import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-hot focus-visible:ring-offset-2 focus-visible:ring-offset-black-ink disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-red-hot text-white border-2 border-red-hot hover:bg-red-dim",
        secondary:
          "bg-orange-accent text-white border-2 border-orange-accent hover:bg-red-hot hover:border-red-hot",
        destructive:
          "bg-red-hot text-white border-2 border-red-hot hover:bg-black-card hover:text-red-hot",
        outline:
          "border-2 border-red-hot bg-transparent text-red-hot hover:bg-red-hot hover:text-white",
        ghost:
          "hover:bg-red-hot/10 hover:text-red-hot border-2 border-transparent hover:border-red-hot",
        link:
          "text-orange-accent underline-offset-4 hover:underline hover:text-red-hot font-bold",
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
