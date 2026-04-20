import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | React.ReactNode
  sub?: string
  subtext?: string
  trend?: string
  color?: "success" | "danger" | "accent" | "info" | "neutral"
}

export function StatCard({ className, label, value, sub, subtext, trend, color = "success", ...props }: StatCardProps) {
  const subTextToUse = sub || subtext
  
  const trendColorMap = {
    success: "text-success",
    danger: "text-danger",
    accent: "text-accent",
    info: "text-info",
    neutral: "text-text-secondary"
  }
  
  return (
    <div className={cn("bg-background-secondary border border-border rounded-xl p-4 transition-all hover:border-border-strong", className)} {...props}>
      <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold text-text-primary font-mono">
        {value}
      </p>
      {(subTextToUse || trend) && (
        <p className={cn("text-xs mt-1.5", trendColorMap[color])}>
          {trend ? `${trend} ` : ''}{subTextToUse}
        </p>
      )}
    </div>
  )
}
