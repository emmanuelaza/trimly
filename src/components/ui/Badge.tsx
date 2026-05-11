import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neutral" | "success" | "warning" | "danger" | "accent" | "info" | "outline" | "solid"
  dot?: boolean
}

const variantClasses: Record<string, string> = {
  default:  "bg-accent/10 text-accent border border-accent/20",
  neutral:  "bg-background-elevated text-text-secondary border border-border",
  success:  "bg-success/10 text-success border border-success/20",
  warning:  "bg-warning/10 text-warning border border-warning/20",
  danger:   "bg-danger/10 text-danger border border-danger/20",
  accent:   "bg-accent/10 text-accent border border-accent/20",
  info:     "bg-info/10 text-info border border-info/20",
  outline:  "bg-transparent text-text-primary border border-border",
  solid:    "bg-accent text-text-inverse border-transparent",
}

const dotColors: Record<string, string> = {
  default: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
  accent:  "bg-accent",
  info:    "bg-info",
  neutral: "bg-text-secondary",
  outline: "bg-text-primary",
  solid:   "bg-text-inverse",
}

function Badge({ className, variant = "neutral", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5",
        "text-xs font-semibold tracking-wide",
        "rounded-full transition-colors",
        variantClasses[variant] ?? variantClasses.neutral,
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant] ?? "bg-accent")} />
      )}
      {children}
    </span>
  )
}

export { Badge }
