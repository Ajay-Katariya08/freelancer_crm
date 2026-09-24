"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { Menu, LogOut, User as UserIcon } from "lucide-react"

type HeaderProps = {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: "FREELANCER" | "CLIENT"
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground">
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="p-0 w-72 max-w-[80vw] data-[side=left]:w-72 data-[side=left]:max-w-[80vw] overflow-hidden border-r border-border"
          >
            <Sidebar
              role={user?.role}
              onItemClick={() => setOpen(false)}
              onClose={() => setOpen(false)}
              className="w-full border-r-0"
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Badge
            variant={user?.role === "CLIENT" ? "secondary" : "default"}
            className="capitalize font-medium text-xs px-2.5 py-0.5"
          >
            {user?.role === "CLIENT" ? "Client Portal" : "Freelancer Pro"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8 border border-border">
              {user?.image ? (
                <AvatarImage src={user.image} alt={user.name || "User"} />
              ) : null}
              <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold leading-none text-foreground">
                {user?.name || user?.email?.split("@")[0] || "Account"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate max-w-[140px]">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Account"}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push("/login")
                router.refresh()
              }}
              className="text-destructive focus:bg-destructive/10 cursor-pointer gap-2"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
