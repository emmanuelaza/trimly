import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./Card"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | React.ReactNode
  sub?: string
  subtext?: string
  trend?: string
  trendColor?: "success" | "danger"
}

export function StatCard({ className, label, value, sub, subtext, trend, trendColor = "success", ...props }: StatCardProps) {
  const subTextToUse = sub || subtext
  
  return (
    <Card className={cn("flex flex-col justify-center transition-all hover:border-border-strong group", className)} {...props}>
      <CardContent className="p-0">
        <h4 className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold mb-2 group-hover:text-text-secondary transition-colors">
          {label}
        </h4>
        <div className="text-2xl font-mono font-semibold text-text-primary">
          {value}
        </div>
        {(subTextToUse || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            {trend && <span className={trendColor === "success" ? "text-success" : "text-danger"}>{trend}</span>}
            {subTextToUse && <span className="text-text-tertiary">{subTextToUse}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
