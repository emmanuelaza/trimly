import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neutral" | "success" | "warning" | "danger" | "accent" | "info"
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        {
          "bg-background-tertiary text-text-secondary": variant === "neutral",
          "bg-success-bg text-success": variant === "success",
          "bg-warning-bg text-warning": variant === "warning",
          "bg-danger-bg text-danger": variant === "danger",
          "bg-accent-muted text-accent": variant === "accent",
          "bg-info-bg text-info": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
