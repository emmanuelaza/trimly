import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background-primary active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-accent text-black hover:bg-[#D4F84A]": variant === "primary",
            "bg-transparent border border-border-strong text-text-secondary hover:bg-background-tertiary hover:text-text-primary": variant === "secondary",
            "bg-transparent text-text-secondary hover:bg-background-tertiary hover:text-text-primary": variant === "ghost",
            "bg-danger text-white hover:bg-danger/90": variant === "danger",
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10 p-2": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
