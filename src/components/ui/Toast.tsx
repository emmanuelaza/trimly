"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "warning" | "error" | "info"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  type?: ToastType
  onClose?: () => void
}

export function Toast({ className, message, type = "info", onClose, ...props }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-background-elevated border border-border-strong rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl z-[9999] animate-in fade-in slide-in-from-bottom-5",
        className
      )}
      {...props}
    >
      <div
        className={cn("w-1.5 h-8 rounded-full flex-shrink-0", {
          "bg-success": type === "success",
          "bg-warning": type === "warning",
          "bg-danger": type === "error",
          "bg-info": type === "info",
        })}
      />
      <p className="text-sm text-text-primary flex-1">{message}</p>
      {onClose && (
        <button onClick={() => { setIsVisible(false); onClose() }} className="text-text-tertiary hover:text-text-primary">
          ×
        </button>
      )}
    </div>
  )
}
