'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ActionMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface ActionMenuProps {
  items: ActionMenuItem[]
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-background-3 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 min-w-[160px] bg-background-secondary border border-border rounded-xl shadow-lg overflow-hidden py-1">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { item.onClick(); setOpen(false) }}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors',
                item.variant === 'danger'
                  ? 'text-danger hover:bg-danger/5'
                  : 'text-text-secondary hover:bg-background-3 hover:text-text-primary',
                item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
              )}
            >
              {item.icon && <span className="flex-shrink-0 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
