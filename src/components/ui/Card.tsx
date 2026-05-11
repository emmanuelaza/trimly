import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
  padding?: "sm" | "md" | "lg" | "none"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glow = false, padding = "md", children, ...props }, ref) => {
    const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }
    return (
      <div
        ref={ref}
        className={cn(
          "bg-background-secondary border border-border rounded-xl",
          "transition-all duration-200",
          hover && "hover:border-border-strong hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
          glow  && "hover:shadow-glow",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref}
      className={cn("flex items-center justify-between mb-4", className)}
      {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref}
      className={cn("font-semibold text-base text-text-primary tracking-tight", className)}
      {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref}
      className={cn("text-sm text-text-secondary", className)}
      {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref}
      className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-border", className)}
      {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
