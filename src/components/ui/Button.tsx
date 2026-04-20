import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:border-accent active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer gap-2",
          {
            "bg-accent text-background-primary hover:bg-accent-hover": variant === "primary",
            "bg-transparent border border-border-strong text-text-secondary hover:bg-background-tertiary hover:text-text-primary": variant === "secondary",
            "bg-transparent border border-danger/30 text-danger hover:bg-danger-bg": variant === "danger",
            "bg-transparent text-text-secondary hover:bg-background-tertiary hover:text-text-primary": variant === "ghost",
            "h-auto px-4 py-2.5 text-sm": size === "default",
            "px-3 py-1.5 text-xs": size === "sm",
            "px-6 py-3 text-base": size === "lg",
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
