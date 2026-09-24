"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  Users,
  Link2,
  CheckSquare,
  Package,
  CreditCard,
  Briefcase,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const freelancerNavItems: NavItem[] = [
  { title: "Overview", href: "/dashboard/freelancer", icon: LayoutDashboard },
  {
    title: "Retainer Tiers",
    href: "/dashboard/freelancer/tiers",
    icon: Layers,
  },
  { title: "Clients", href: "/dashboard/freelancer/clients", icon: Users },
  { title: "Invite Links", href: "/dashboard/freelancer/links", icon: Link2 },
  {
    title: "All Tasks",
    href: "/dashboard/freelancer/tasks",
    icon: CheckSquare,
  },
];

const clientNavItems: NavItem[] = [
  { title: "Overview", href: "/dashboard/client", icon: LayoutDashboard },
  {
    title: "Submit & Track Tasks",
    href: "/dashboard/client/tasks",
    icon: CheckSquare,
  },
  {
    title: "Deliverables",
    href: "/dashboard/client/deliverables",
    icon: Package,
  },
  {
    title: "Plan & Billing",
    href: "/dashboard/client/billing",
    icon: CreditCard,
  },
];

type SidebarProps = {
  role?: "FREELANCER" | "CLIENT";
  className?: string;
  onItemClick?: () => void;
  onClose?: () => void;
};

export function Sidebar({
  role = "FREELANCER",
  className,
  onItemClick,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const items = role === "CLIENT" ? clientNavItems : freelancerNavItems;

  return (
    <aside
      className={cn(
        "flex min-h-dvh! w-full md:w-64 flex-col border-r border-border bg-card text-card-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-border">
        <BrandLogo
          size="md"
          subtitle={role === "CLIENT" ? "Client Portal" : "Freelancer CRM"}
        />

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 h-full">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground",
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-border">
        <div className="rounded-lg bg-muted/60 p-3 text-xs">
          <p className="font-medium text-foreground">Need client preview?</p>
          <p className="mt-1 text-muted-foreground">
            Generate a direct link to see client checkout view.
          </p>
          <Link
            href="/dashboard/freelancer/links"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create link <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
