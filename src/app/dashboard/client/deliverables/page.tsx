import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Package, Download } from "lucide-react"

export default async function ClientDeliverablesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "FREELANCER") redirect("/dashboard/freelancer")

  const deliverables = await prisma.deliverable.findMany({
    where: { clientId: session.user.id },
    include: { task: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Deliverables</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access and download completed work, source files, and finalized project assets.
        </p>
      </div>

      {deliverables.length === 0 ? (
        <Card className="border-dashed border-border bg-transparent p-12 text-center text-xs text-muted-foreground">
          <Package className="mx-auto size-10 text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground text-sm">No deliverables published yet</p>
          <p className="mt-1">
            As your freelancer completes your queued tasks, finished assets will be published here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((del) => (
            <Card key={del.id} className="border-border bg-card shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{del.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {del.description || "Project deliverable"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="border-t border-border/60 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Published {formatDate(del.createdAt)}</span>
                  {del.task?.title ? (
                    <span className="truncate max-w-[120px]">Task: {del.task.title}</span>
                  ) : null}
                </div>

                {del.fileUrl ? (
                  <a
                    href={del.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      size: "sm",
                      className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-medium",
                    })}
                  >
                    <Download className="size-3.5" /> Download Asset
                  </a>
                ) : (
                  <Button disabled size="sm" variant="outline" className="w-full text-xs">
                    No attachment provided
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
