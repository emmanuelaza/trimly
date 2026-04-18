import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors border",
        {
          "bg-background-tertiary text-text-secondary border-border": variant === "default",
          "bg-success-bg text-success border-success/20": variant === "success",
          "bg-warning-bg text-warning border-warning/20": variant === "warning",
          "bg-danger-bg text-danger border-danger/20": variant === "danger",
          "bg-info-bg text-info border-info/20": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
