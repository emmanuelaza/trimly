import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "default" | "secondary" | "outline" | "ghost" | "danger" | "success" | "link"
type Size    = "xs" | "sm" | "md" | "default" | "lg" | "xl" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:   "bg-accent text-text-inverse hover:bg-accent-hover shadow-sm hover:shadow-glow",
  default:   "bg-accent text-text-inverse hover:bg-accent-hover shadow-sm hover:shadow-glow",
  secondary: "bg-background-3 text-text-primary border border-border hover:bg-background-4 hover:border-border-strong",
  outline:   "bg-transparent text-accent border border-accent/30 hover:bg-accent/10 hover:border-accent/60",
  ghost:     "bg-transparent text-text-secondary hover:bg-background-3 hover:text-text-primary",
  danger:    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:border-danger/50",
  success:   "bg-success/10 text-success border border-success/30 hover:bg-success/20 hover:border-success/50",
  link:      "bg-transparent text-accent underline-offset-4 hover:underline p-0 h-auto",
}

const sizeClasses: Record<Size, string> = {
  xs:      "h-7 px-3 text-xs rounded-md gap-1.5",
  sm:      "h-8 px-3.5 text-xs rounded-md",
  md:      "h-10 px-4 text-sm rounded-lg",
  default: "h-auto px-4 py-2.5 text-sm rounded-lg",
  lg:      "h-11 px-5 text-base rounded-lg",
  xl:      "h-13 px-6 text-lg rounded-xl",
  icon:    "h-9 w-9 rounded-lg p-0",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", loading,
     leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-medium tracking-tight",
          "border border-transparent",
          "transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
          "active:scale-[0.98]",
          variantClasses[variant] ?? variantClasses.primary,
          sizeClasses[size]   ?? sizeClasses.default,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
