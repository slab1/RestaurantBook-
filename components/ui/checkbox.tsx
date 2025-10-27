"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<"input">,
  React.ComponentPropsWithoutRef<"input"> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked)
    props.onChange?.(event)
  }

  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className="sr-only"
        ref={ref}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          checked && "bg-primary text-primary-foreground",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" />
        )}
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }