"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium dark:text-gray-200">
          {label}
        </Label>
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            className={cn(
              "transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700",
              error && "border-red-500 focus-visible:ring-red-500",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 animate-fade-in">{error}</p>}
      </div>
    )
  }
)

FormInput.displayName = "FormInput"; 