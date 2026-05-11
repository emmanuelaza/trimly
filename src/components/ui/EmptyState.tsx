import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./Button"
import Link from "next/link"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: string | React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: ButtonProps["variant"]
  }
}

export function EmptyState({ className, icon = "📭", title, description, action, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
      {...props}
    >
      <div className="text-5xl mb-4 opacity-40 select-none">
        {icon}
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-xs text-text-secondary mb-5 max-w-xs leading-relaxed">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant={action.variant ?? "outline"} size="sm">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant={action.variant ?? "outline"} size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
