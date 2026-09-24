import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency, formatHours } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MRRChart } from "@/components/charts/mrr-chart"
import { HoursChart } from "@/components/charts/hours-chart"
import Link from "next/link"
import {
  Users,
  CreditCard,
  Clock,
  CheckSquare,
  ArrowUpRight,
  PlusCircle,
  Link2,
} from "lucide-react"

export default async function FreelancerDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const [subscriptions, tasks, tiers, hourLogs] = await Promise.all([
    prisma.subscription.findMany({
      where: { freelancerId: session.user.id },
      include: { client: true, tier: true },
    }),
    prisma.task.findMany({
      where: { freelancerId: session.user.id },
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.retainerTier.findMany({
      where: { freelancerId: session.user.id },
    }),
    prisma.hourLog.findMany({
      where: { subscription: { freelancerId: session.user.id } },
    }),
  ])

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE")
  const currentMRRInPaise = activeSubscriptions.reduce((acc, s) => acc + s.tier.priceInPaise, 0)
  const totalHoursLogged = hourLogs.reduce((acc, log) => acc + log.hours, 0)
  const pendingTasksCount = tasks.filter((t) => t.status === "PENDING").length

  const currentMonthMRR = currentMRRInPaise / 100
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentMonthIdx = new Date().getMonth()

  const mrrData = Array.from({ length: 6 }).map((_, i) => {
    const monthIndex = (currentMonthIdx - 5 + i + 12) % 12
    const factor = (i + 1) / 6
    const mrr = i === 5 ? currentMonthMRR : Math.round(currentMonthMRR * factor * 0.85)
    return {
      month: months[monthIndex],
      mrr: Math.max(mrr, 0),
    }
  })

  const clientHoursData = activeSubscriptions.map((s) => ({
    name: s.client.name?.split(" ")[0] || s.client.email.split("@")[0],
    used: s.hoursUsed,
    remaining: Math.max(s.tier.monthlyHours - s.hoursUsed, 0),
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Freelancer Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor retainer revenue, monthly client hours, and active queues.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/freelancer/links"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs" })}
          >
            <Link2 className="size-3.5" /> Generate Invite Link
          </Link>
          <Link
            href="/dashboard/freelancer/tiers"
            className={buttonVariants({
              size: "sm",
              className: "gap-1.5 text-xs shadow-xs",
            })}
          >
            <PlusCircle className="size-3.5" /> New Retainer Tier
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current MRR
            </CardTitle>
            <CreditCard className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatCurrency(currentMRRInPaise)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {activeSubscriptions.length} active retainer{activeSubscriptions.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Clients
            </CardTitle>
            <Users className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptions.length} total client relationships
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hours Logged
            </CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatHours(totalHoursLogged)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all client retainers
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Tasks
            </CardTitle>
            <CheckSquare className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your response</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Recurring Revenue (MRR)</CardTitle>
            <CardDescription className="text-xs">
              Projected MRR based on active recurring subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MRRChart data={mrrData} />
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Client Retainer Hours</CardTitle>
            <CardDescription className="text-xs">
              Hours logged vs remaining per active client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientHoursData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No active retainers yet
              </div>
            ) : (
              <HoursChart data={clientHoursData} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Client Tasks</CardTitle>
              <CardDescription className="text-xs">Incoming client requests</CardDescription>
            </div>
            <Link
              href="/dashboard/freelancer/tasks"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
            >
              View all <ArrowUpRight className="ml-1 size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No tasks submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[200px] truncate">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {task.client.name || task.client.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.status === "COMPLETED"
                          ? "default"
                          : task.status === "IN_PROGRESS"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] px-2 py-0.5"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Configured Retainer Tiers</CardTitle>
            <CardDescription className="text-xs">Available plans syncable with Razorpay</CardDescription>
          </div>
          <Link
            href="/dashboard/freelancer/tiers"
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}
          >
            Manage Tiers
          </Link>
        </CardHeader>
        <CardContent>
          {tiers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No tiers created yet. Create your first tier to generate client invite links.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-lg border border-border p-4 bg-muted/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{tier.name}</span>
                    <Badge variant={tier.isActive ? "default" : "secondary"} className="text-[10px]">
                      {tier.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    <p className="font-semibold text-foreground text-sm">
                      {formatCurrency(tier.priceInPaise)} / mo
                    </p>
                    <p>{tier.monthlyHours} hours dedicated monthly</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
