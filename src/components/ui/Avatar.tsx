import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  /** Text to display when no image — also aliased as `initials` */
  fallback?: string
  /** Alias for `fallback` — both are supported */
  initials?: string
  size?: "sm" | "md" | "lg"
  isVip?: boolean
}

export function Avatar({ className, src, alt, fallback, initials, size = "md", isVip = false, ...props }: AvatarProps) {
  const text = fallback || initials || ""
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-medium",
        {
          // Default styling (neutral)
          "bg-background-tertiary border border-border-strong text-text-secondary": !isVip,
          // VIP styling (accent)
          "bg-accent-muted border border-accent/20 text-accent": isVip,
          
          // Sizes
          "w-8 h-8 text-[10px]": size === "sm",
          "w-9 h-9 text-xs": size === "md",
          "w-16 h-16 text-xl": size === "lg",
        },
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  )
}
