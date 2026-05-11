import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number | React.ReactNode
  sub?: string
  subtext?: string
  trend?: string | { value: string | number; isPositive?: boolean; label?: string }
  icon?: LucideIcon | React.ReactNode
  color?: "success" | "danger" | "accent" | "info" | "neutral" | "warning"
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  loading?: boolean
}

const colorMap: Record<string, string> = {
  success: "text-success bg-success/10",
  danger:  "text-danger bg-danger/10",
  accent:  "text-accent bg-accent/10",
  info:    "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  neutral: "text-text-secondary bg-background-elevated",
}

const textColorMap: Record<string, string> = {
  success: "text-success",
  danger:  "text-danger",
  accent:  "text-accent",
  info:    "text-info",
  warning: "text-warning",
  neutral: "text-text-secondary",
}

export function StatCard({
  className, label, value, sub, subtext, trend,
  icon: Icon, color = "success", variant, loading, ...props
}: StatCardProps) {
  const subTextToUse = sub || subtext

  if (loading) {
    return (
      <div className={cn("bg-background-secondary border border-border rounded-xl p-5", className)}>
        <div className="skeleton h-3 w-24 mb-4 rounded" />
        <div className="skeleton h-7 w-32 mb-2 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  const iconNode = Icon && React.isValidElement(Icon as React.ReactElement)
    ? Icon as React.ReactNode
    : Icon
      ? React.createElement(Icon as LucideIcon, { size: 16 })
      : null

  return (
    <div
      className={cn(
        "bg-background-secondary border border-border rounded-xl p-5",
        "transition-all hover:border-border-strong relative overflow-hidden group",
        variant === "primary" && "border-accent/20 bg-accent/5",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
          {label}
        </p>
        {iconNode && (
          <div className={cn(
            "p-2 rounded-lg transition-transform group-hover:scale-110",
            colorMap[color]
          )}>
            {iconNode}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-black text-text-primary tracking-tight">
          {value}
        </p>
        {(subTextToUse || trend) && (
          <div className="flex items-center gap-1.5">
            {trend && (
              typeof trend === "string" ? (
                <p className={cn("text-[10px] font-bold", textColorMap[color])}>
                  {trend}
                </p>
              ) : (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-sm",
                  trend.isPositive !== false
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
                )}>
                  {trend.value}
                  {trend.label && (
                    <span className="text-text-muted font-normal ml-1">{trend.label}</span>
                  )}
                </span>
              )
            )}
            {subTextToUse && (
              <p className="text-[10px] text-text-tertiary font-medium">{subTextToUse}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
