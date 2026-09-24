import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { formatCurrency, formatHours, formatDate, formatDateTime } from "@/lib/utils"
import { logHours } from "@/app/actions/hours"
import { createDeliverable } from "@/app/actions/deliverables"
import { updateTaskStatus } from "@/app/actions/tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoursChart } from "@/components/charts/hours-chart"
import { ArrowLeft, Clock, Upload, Download, Package } from "lucide-react"
import Link from "next/link"

type ClientDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const { id: clientId } = await params

  const client = await prisma.user.findUnique({
    where: { id: clientId },
  })

  if (!client) notFound()

  const subscription = await prisma.subscription.findFirst({
    where: { clientId, freelancerId: session.user.id },
    include: {
      tier: true,
      tasks: { orderBy: { createdAt: "desc" } },
      hourLogs: { orderBy: { loggedAt: "desc" }, include: { task: true } },
      deliverables: { orderBy: { createdAt: "desc" }, include: { task: true } },
    },
  })

  if (!subscription) notFound()

  const percentUsed = Math.min(
    Math.round((subscription.hoursUsed / subscription.tier.monthlyHours) * 100),
    100
  )
  const hoursRemaining = Math.max(subscription.tier.monthlyHours - subscription.hoursUsed, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/freelancer/clients"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs" })}
        >
          <ArrowLeft className="size-4" /> Back to Clients
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {client.name || "Client"}
            </h1>
            <Badge variant="outline" className="text-xs">
              {subscription.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{client.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current Plan</p>
          <p className="text-base font-bold text-foreground">{subscription.tier.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(subscription.tier.priceInPaise)}/mo • Renews {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Hours Logged This Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {formatHours(subscription.hoursUsed)}
            </div>
            <div className="mt-2 space-y-1">
              <Progress value={percentUsed} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground text-right">{percentUsed}% utilized</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Hours Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatHours(hoursRemaining)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Out of {subscription.tier.monthlyHours} monthly hours
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Deliverables Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">
              {subscription.deliverables.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available in client portal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-indigo-500" /> Log Work Hours
              </CardTitle>
              <CardDescription className="text-xs">
                Record time spent towards this retainer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server"
                  await logHours(null, formData)
                }}
                className="space-y-3.5 text-xs"
              >
                <input type="hidden" name="subscriptionId" value={subscription.id} />

                <div className="space-y-1">
                  <Label htmlFor="hours" className="text-xs">Hours to Log</Label>
                  <Input
                    id="hours"
                    name="hours"
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="24"
                    placeholder="e.g. 2.5"
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="taskId" className="text-xs">Associated Task (Optional)</Label>
                  <select
                    id="taskId"
                    name="taskId"
                    className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-ring outline-none"
                  >
                    <option value="">-- General retainer work --</option>
                    {subscription.tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Implemented webhook handlers, refactored API..."
                    className="text-xs min-h-[60px]"
                  />
                </div>

                <SubmitButton size="sm" pendingText="Recording..." className="w-full font-medium text-xs shadow-xs">
                  Record Hours
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Upload className="size-4 text-emerald-500" /> Upload Deliverable
              </CardTitle>
              <CardDescription className="text-xs">
                Upload files or provide deliverables to client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server"
                  await createDeliverable(null, formData)
                }}
                className="space-y-3.5 text-xs"
              >
                <input type="hidden" name="subscriptionId" value={subscription.id} />

                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs">Deliverable Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Design Assets v1.0"
                    required
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fileUrl" className="text-xs">File / Asset URL</Label>
                  <Input
                    id="fileUrl"
                    name="fileUrl"
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs">Notes (Optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Attached final export and source files..."
                    className="text-xs min-h-[60px]"
                  />
                </div>

                <SubmitButton
                  size="sm"
                  pendingText="Publishing..."
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                >
                  Publish to Client Portal
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Hours Allocation</CardTitle>
              <CardDescription className="text-xs">
                Monthly retainer hours utilized vs remaining for this cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HoursChart
                data={[
                  {
                    name: subscription.tier.name,
                    used: subscription.hoursUsed,
                    remaining: hoursRemaining,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
              <TabsTrigger
                value="tasks"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
              >
                Client Tasks ({subscription.tasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="deliverables"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
              >
                Deliverables ({subscription.deliverables.length})
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 text-xs"
              >
                Hour History ({subscription.hourLogs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="pt-4 space-y-3">
              {subscription.tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No tasks submitted by client yet.
                </div>
              ) : (
                subscription.tasks.map((task) => (
                  <Card key={task.id} className="border-border bg-card shadow-2xs">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold">{task.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {task.description || "No description"}
                          </CardDescription>
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
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                      <span>Submitted {formatDateTime(task.createdAt)}</span>
                      <div className="flex items-center gap-1.5">
                        {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && (
                          <form
                            action={async () => {
                              "use server"
                              await updateTaskStatus(task.id, "IN_PROGRESS")
                            }}
                          >
                            <Button size="xs" variant="outline" type="submit" className="text-[10px]">
                              Start Work
                            </Button>
                          </form>
                        )}
                        {task.status !== "COMPLETED" && (
                          <form
                            action={async () => {
                              "use server"
                              await updateTaskStatus(task.id, "COMPLETED")
                            }}
                          >
                            <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]" type="submit">
                              Mark Complete
                            </Button>
                          </form>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="deliverables" className="pt-4 space-y-3">
              {subscription.deliverables.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No deliverables published yet.
                </div>
              ) : (
                subscription.deliverables.map((del) => (
                  <Card key={del.id} className="border-border bg-card shadow-2xs p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Package className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{del.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {del.description || "Deliverable"} • {formatDate(del.createdAt)}
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
                        <Download className="size-3" /> Download
                      </a>
                    ) : null}
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="logs" className="pt-4 space-y-2">
              {subscription.hourLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No logged hours recorded yet.
                </div>
              ) : (
                subscription.hourLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 text-xs bg-muted/20"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {log.task?.title ? `Task: ${log.task.title}` : "General Retainer Hours"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{log.description || "Logged time"}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatHours(log.hours)}</span>
                      <p className="text-[10px] text-muted-foreground">{formatDate(log.loggedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
