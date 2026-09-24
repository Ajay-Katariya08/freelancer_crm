"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { Button, buttonVariants } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

type SubmitButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    pendingText?: string
    loadingIcon?: React.ReactNode
  }

export function SubmitButton({
  children,
  pendingText,
  disabled,
  className,
  variant = "default",
  size = "default",
  loadingIcon,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending || disabled}
      className={className}
      {...props}
    >
      {pending ? (
        <>
          {loadingIcon || <Loader2 className="size-3.5 animate-spin" />}
          <span>{pendingText || children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
