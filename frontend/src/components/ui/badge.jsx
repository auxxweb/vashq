import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary/15 text-primary border border-primary/20",
    secondary: "bg-muted text-muted-foreground border border-border",
    destructive: "bg-red-50 text-red-600 border border-red-100",
    outline: "border border-border bg-card text-foreground",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
