import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-soft-md",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-border bg-card hover:bg-muted/80 text-foreground",
    secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border",
    ghost: "hover:bg-muted/80 text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2 rounded-xl min-h-[44px]",
    sm: "h-9 rounded-xl px-3 min-h-[40px]",
    lg: "h-11 rounded-xl px-8 min-h-[44px]",
    icon: "h-10 w-10 rounded-xl min-h-[44px] min-w-[44px]",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
