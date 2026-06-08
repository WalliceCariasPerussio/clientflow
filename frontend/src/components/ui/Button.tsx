import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const variants: Record<string, string> = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

const sizes: Record<string, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs rounded-md",
  lg: "h-10 px-6 rounded-md",
  icon: "h-9 w-9",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant], sizes[size], className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button, type ButtonProps }
