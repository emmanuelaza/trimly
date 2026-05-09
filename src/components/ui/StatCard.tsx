import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | React.ReactNode
  sub?: string
  subtext?: string
  trend?: string | {
    value: string;
    isPositive?: boolean;
  }
  icon?: LucideIcon
  color?: "success" | "danger" | "accent" | "info" | "neutral" | "warning"
}

export function StatCard({ className, label, value, sub, subtext, trend, icon: Icon, color = "success", ...props }: StatCardProps) {
  const subTextToUse = sub || subtext
  
  const colorMap = {
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    accent: "text-accent bg-accent/10",
    info: "text-info bg-info/10",
    warning: "text-warning bg-warning/10",
    neutral: "text-text-secondary bg-background-tertiary"
  }

  const textColorMap = {
    success: "text-success",
    danger: "text-danger",
    accent: "text-accent",
    info: "text-info",
    warning: "text-warning",
    neutral: "text-text-secondary"
  }
  
  return (
    <div className={cn("bg-background-secondary border border-border rounded-xl p-5 transition-all hover:border-border-strong relative overflow-hidden group", className)} {...props}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
          {label}
        </p>
        {Icon && (
          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", colorMap[color])}>
            <Icon size={16} />
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
              typeof trend === 'string' ? (
                <p className={cn("text-[10px] font-bold", textColorMap[color])}>
                  {trend}
                </p>
              ) : (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-sm", trend.isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
                  {trend.value}
                </span>
              )
            )}
            {subTextToUse && (
              <p className="text-[10px] text-text-tertiary font-medium">
                {subTextToUse}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
