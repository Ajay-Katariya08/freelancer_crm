import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { updateTaskStatus } from "@/app/actions/tasks"
import { formatDateTime } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default async function FreelancerTasksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const tasks = await prisma.task.findMany({
    where: { freelancerId: session.user.id },
    include: {
      client: true,
      subscription: { include: { tier: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const pending = tasks.filter((t) => t.status === "PENDING")
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS")
  const completed = tasks.filter((t) => t.status === "COMPLETED")

  const renderTaskList = (taskList: typeof tasks) => {
    if (taskList.length === 0) {
      return (
        <Card className="border-dashed border-border bg-transparent p-8 text-center text-xs text-muted-foreground">
          No tasks found in this category.
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {taskList.map((task) => (
          <Card key={task.id} className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">
                      {task.title}
                    </CardTitle>
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
                  <CardDescription className="text-xs mt-1">
                    {task.description || "No description provided"}
                  </CardDescription>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-foreground block">
                    {task.client.name || task.client.email}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {task.subscription.tier.name}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-muted-foreground border-t border-border/50">
              <span>Submitted {formatDateTime(task.createdAt)}</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/freelancer/clients/${task.clientId}`}
                  className={buttonVariants({ variant: "ghost", size: "xs", className: "text-[10px] gap-1" })}
                >
                  Client Hub <ArrowRight className="size-3" />
                </Link>

                {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && (
                  <form
                    action={async () => {
                      "use server"
                      await updateTaskStatus(task.id, "IN_PROGRESS")
                    }}
                  >
                    <Button size="xs" variant="outline" type="submit" className="text-[10px]">
                      Move to In Progress
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
                      Mark Completed
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">All Client Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Unified queue of all client submissions across all retainers.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/40 p-1">
          <TabsTrigger value="all" className="text-xs">
            All ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="text-xs">
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          {renderTaskList(tasks)}
        </TabsContent>
        <TabsContent value="pending" className="pt-4">
          {renderTaskList(pending)}
        </TabsContent>
        <TabsContent value="inProgress" className="pt-4">
          {renderTaskList(inProgress)}
        </TabsContent>
        <TabsContent value="completed" className="pt-4">
          {renderTaskList(completed)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
