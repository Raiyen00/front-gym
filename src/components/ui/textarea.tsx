import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-md border border-input bg-input-bg px-3 py-2 text-sm text-foreground transition-[color,box-shadow,border-color] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-[#33503f] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
