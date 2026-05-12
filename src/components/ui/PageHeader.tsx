import React from 'react'
import { Button } from './Button'

interface PageHeaderAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: PageHeaderAction
  badge?: string
  count?: number
}

export function PageHeader({ title, description, action, badge, count }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">{title}</h1>
          {typeof count === 'number' && (
            <span className="px-2 py-0.5 text-xs font-bold bg-background-tertiary text-text-muted rounded-full">
              {count}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-text-muted mt-0.5">{description}</p>}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} leftIcon={action.icon} className="flex-shrink-0">
          {action.label}
        </Button>
      )}
    </div>
  )
}
