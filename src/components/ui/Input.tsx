import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "w-full h-10 px-3.5 py-2.5",
              "bg-background-tertiary border border-border rounded-lg",
              "text-sm text-text-primary",
              "placeholder:text-text-tertiary",
              "transition-all duration-150",
              "focus:outline-none focus:border-accent focus:shadow-glow",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              error     && "border-danger focus:border-danger focus:shadow-none",
              leftIcon  && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-text-muted pointer-events-none">{rightIcon}</span>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
