import * as React from "react"
import { cn } from "@/lib/utils"
import { ButtonProps, Button } from "./Button"
import Link from "next/link"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
    variant?: ButtonProps["variant"]
  }
}

export function EmptyState({ className, icon, title, description, action, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)} {...props}>
      <div className="w-12 h-12 rounded-xl bg-background-tertiary flex items-center justify-center mb-4 text-xl text-text-tertiary">
        {icon}
      </div>
      <p className="text-sm font-medium text-text-primary mb-1">{title}</p>
      <p className="text-xs text-text-secondary mb-5 max-w-xs">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant={action.variant || "primary"}>
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant={action.variant || "primary"} onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
