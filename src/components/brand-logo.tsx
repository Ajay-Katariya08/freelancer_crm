import * as React from "react"
import { cn } from "@/lib/utils"
import { Orbit } from "lucide-react"

type BrandLogoProps = {
  className?: string
  iconClassName?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  subtitle?: string
}

export function BrandLogo({
  className,
  iconClassName,
  size = "md",
  showText = true,
  subtitle,
}: BrandLogoProps) {
  const sizeMap = {
    sm: { box: "size-7.5 p-1.5", icon: "size-4", text: "text-sm", sub: "text-[9px]" },
    md: { box: "size-9 p-1.5", icon: "size-5", text: "text-base", sub: "text-[10px]" },
    lg: { box: "size-11 p-2", icon: "size-6", text: "text-xl", sub: "text-xs" },
  }

  const current = sizeMap[size]

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 shrink-0",
          current.box,
          iconClassName
        )}
      >
        <Orbit className={cn(current.icon, "text-white")} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-black tracking-tight text-foreground",
              current.text
            )}
          >
            Aura<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
          {subtitle && (
            <span
              className={cn(
                "uppercase font-semibold tracking-wider text-muted-foreground mt-0.5",
                current.sub
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
