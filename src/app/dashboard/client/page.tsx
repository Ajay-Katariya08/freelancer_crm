import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency, formatHours, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HoursChart } from "@/components/charts/hours-chart"
import Link from "next/link"
import {
  Clock,
  Package,
  ArrowRight,
  PlusCircle,
  Download,
  AlertCircle,
} from "lucide-react"

export default async function ClientDashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "FREELANCER") redirect("/dashboard/freelancer")

  const subscription = await prisma.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: {
      freelancer: true,
      tier: true,
      tasks: { orderBy: { createdAt: "desc" }, take: 4 },
      deliverables: { orderBy: { createdAt: "desc" }, take: 4 },
    },
  })

  if (!subscription) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="mx-auto size-12 text-amber-500" />
        <h1 className="text-2xl font-bold tracking-tight">No Active Retainer Subscription</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You don't have an active retainer linked with your account yet. Use the invite link provided by your freelancer to activate your portal.
        </p>
        <Link
          href="/"
          className={buttonVariants({ className: "shadow-xs" })}
        >
          Back to Home
        </Link>
      </div>
    )
  }

  const { tier, freelancer } = subscription
  const percentUsed = Math.min(
    Math.round((subscription.hoursUsed / tier.monthlyHours) * 100),
    100
  )
  const hoursRemaining = Math.max(tier.monthlyHours - subscription.hoursUsed, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome, {session.user.name || "Client"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Dedicated retainer portal with {freelancer.name || "your Freelancer"}.
          </p>
        </div>
        <Link
          href="/dashboard/client/tasks"
          className={buttonVariants({
            className: "gap-1.5 text-xs shadow-xs",
          })}
        >
          <PlusCircle className="size-3.5" /> Submit New Request
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Current Plan
            </CardTitle>
            <Badge variant="default" className="text-[10px]">
              {subscription.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{tier.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(tier.priceInPaise)}/mo • Renews {formatDate(subscription.currentPeriodEnd)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Monthly Hours Remaining
            </CardTitle>
            <Clock className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatHours(hoursRemaining)}
            </div>
            <div className="mt-2 space-y-1">
              <Progress value={percentUsed} className="h-1.5" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{formatHours(subscription.hoursUsed)} logged</span>
                <span>{formatHours(tier.monthlyHours)} total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Dedicated Freelancer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">
              {freelancer.name || "Freelancer Pro"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{freelancer.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Hours Allocation</CardTitle>
          <CardDescription className="text-xs">
            Retainer hours utilized vs remaining for the current billing period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HoursChart
            data={[
              {
                name: tier.name,
                used: subscription.hoursUsed,
                remaining: hoursRemaining,
              },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Your Active Requests</CardTitle>
              <CardDescription className="text-xs">Recent tasks in queue</CardDescription>
            </div>
            <Link
              href="/dashboard/client/tasks"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
            >
              View all <ArrowRight className="ml-1 size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {subscription.tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No tasks submitted yet. Click "Submit New Request" to create your first task.
              </div>
            ) : (
              <div className="space-y-3">
                {subscription.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-xs bg-muted/20"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{task.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {task.description || "Task in queue"}
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
                      className="text-[10px]"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Ready Deliverables</CardTitle>
              <CardDescription className="text-xs">Completed files and assets</CardDescription>
            </div>
            <Link
              href="/dashboard/client/deliverables"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
            >
              View all <ArrowRight className="ml-1 size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {subscription.deliverables.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No deliverables ready yet. Once completed, your freelancer will upload assets here.
              </div>
            ) : (
              <div className="space-y-3">
                {subscription.deliverables.map((del) => (
                  <div
                    key={del.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-xs bg-muted/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Package className="size-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{del.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(del.createdAt)}
                        </p>
                      </div>
                    </div>
                    {del.fileUrl ? (
                      <a
                        href={del.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ size: "xs", variant: "outline", className: "text-xs gap-1" })}
                      >
                        <Download className="size-3" /> Get File
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
