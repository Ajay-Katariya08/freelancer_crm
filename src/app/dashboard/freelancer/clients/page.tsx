import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency, formatHours, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, UserCheck } from "lucide-react"

export default async function FreelancerClientsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const subscriptions = await prisma.subscription.findMany({
    where: { freelancerId: session.user.id },
    include: {
      client: true,
      tier: true,
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Clients & Retainers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your subscribed clients, track billable hours, and inspect deliverables.
          </p>
        </div>
        <Link
          href="/dashboard/freelancer/links"
          className={buttonVariants({
            size: "sm",
            className: "text-xs gap-1.5 shadow-xs",
          })}
        >
          Invite New Client
        </Link>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Client Roster</CardTitle>
          <CardDescription className="text-xs">
            Overview of client subscription status and hour quotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <UserCheck className="mx-auto size-8 text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-foreground">No active clients yet</p>
              <p className="mt-1">
                Generate an invite link and send it to your client to get them on a recurring retainer.
              </p>
              <Link
                href="/dashboard/freelancer/links"
                className={buttonVariants({ size: "sm", variant: "outline", className: "mt-4 text-xs" })}
              >
                Generate Invite Link
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Tier</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Monthly Rate</TableHead>
                    <TableHead className="text-xs">Hours Usage</TableHead>
                    <TableHead className="text-xs">Renewal Date</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const percentUsed = Math.min(
                      Math.round((sub.hoursUsed / sub.tier.monthlyHours) * 100),
                      100
                    )
                    return (
                      <TableRow key={sub.id} className="text-xs">
                        <TableCell className="font-medium">
                          <div>
                            <p className="text-foreground font-semibold">
                              {sub.client.name || "Client"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{sub.client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{sub.tier.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={sub.status === "ACTIVE" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {formatCurrency(sub.tier.priceInPaise)}/mo
                        </TableCell>
                        <TableCell className="w-[180px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span>{formatHours(sub.hoursUsed)} used</span>
                              <span className="text-muted-foreground">
                                {formatHours(sub.tier.monthlyHours)} total
                              </span>
                            </div>
                            <Progress value={percentUsed} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(sub.currentPeriodEnd)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/freelancer/clients/${sub.clientId}`}
                            className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 gap-1 text-xs" })}
                          >
                            View <ArrowRight className="size-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
