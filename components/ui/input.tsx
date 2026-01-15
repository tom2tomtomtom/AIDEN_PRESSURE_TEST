import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border-2 border-border-subtle bg-black-card px-4 py-2 text-base text-white-full transition-all file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-red-hot placeholder:text-white-dim hover:border-border-strong focus:border-red-hot focus:bg-black-deep focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
