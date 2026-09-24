import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createClientTask } from "@/app/actions/tasks"
import { formatDateTime } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"

export default async function ClientTasksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "FREELANCER") redirect("/dashboard/freelancer")

  const tasks = await prisma.task.findMany({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Task Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Submit new requests and track status directly in your freelancer's queue.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-xs lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PlusCircle className="size-4 text-indigo-500" /> Submit New Task
            </CardTitle>
            <CardDescription className="text-xs">
              Directly queues into your freelancer's dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server"
                await createClientTask(null, formData)
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Design newsletter template"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs">Description & Requirements</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide context, references, or links to requirements..."
                  className="text-xs min-h-[90px]"
                />
              </div>

              <Button type="submit" size="sm" className="w-full font-medium text-xs shadow-xs">
                Submit Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Submitted Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <Card className="border-dashed border-border bg-transparent p-8 text-center text-xs text-muted-foreground">
              You haven't submitted any tasks yet. Use the form on the left to submit your first request.
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="border-border bg-card shadow-xs">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          {task.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {task.description || "No description provided"}
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
                  <CardContent className="p-4 pt-2 text-[11px] text-muted-foreground border-t border-border/50">
                    <span>Submitted on {formatDateTime(task.createdAt)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
