import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { createTier, toggleTierStatus, deleteTier } from "@/app/actions/tiers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Trash2, Power } from "lucide-react"

export default async function RetainerTiersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const tiers = await prisma.retainerTier.findMany({
    where: { freelancerId: session.user.id },
    include: {
      subscriptions: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Retainer Tiers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define recurring subscription tiers for your clients. Each tier connects with Razorpay.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-xs lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plus className="size-4 text-indigo-500" /> Create New Tier
            </CardTitle>
            <CardDescription className="text-xs">
              Configure hours and monthly rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={async (formData: FormData) => {
              "use server"
              await createTier(null, formData)
            }} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Tier Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Standard Retainer"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyHours" className="text-xs">Monthly Hours</Label>
                <Input
                  id="monthlyHours"
                  name="monthlyHours"
                  type="number"
                  placeholder="10"
                  min="1"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priceInRupees" className="text-xs">Monthly Price (₹ INR)</Label>
                <Input
                  id="priceInRupees"
                  name="priceInRupees"
                  type="number"
                  placeholder="25000"
                  min="100"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What deliverables, turnaround time, or scope are included?"
                  className="text-xs min-h-[70px]"
                />
              </div>

              <Button type="submit" className="w-full text-xs font-semibold shadow-xs">
                Save & Sync with Razorpay
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Your Tiers ({tiers.length})</h2>
          {tiers.length === 0 ? (
            <Card className="border-dashed border-border bg-transparent p-8 text-center text-xs text-muted-foreground">
              No tiers created yet. Use the form on the left to set up your first retainer offering.
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tiers.map((tier: any) => (
                <Card key={tier.id} className="border-border bg-card shadow-xs flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">{tier.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5 line-clamp-2">
                          {tier.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <Badge variant={tier.isActive ? "default" : "secondary"} className="text-[10px]">
                        {tier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <div className="flex items-baseline justify-between border-t border-border/60 pt-3 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3.5" /> Monthly Hours
                      </span>
                      <span className="font-semibold text-foreground">{tier.monthlyHours} hrs</span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="text-muted-foreground">Monthly Fee</span>
                      <span className="font-bold text-sm text-foreground">
                        {formatCurrency(tier.priceInPaise)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-border/60 pt-2 text-xs">
                      <span className="text-muted-foreground">Active Subscriptions</span>
                      <span className="font-semibold text-foreground">
                        {tier.subscriptions.filter((s: any) => s.status === "ACTIVE").length}
                      </span>
                    </div>
                    {tier.razorpayPlanId ? (
                      <div className="rounded bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground truncate">
                        Razorpay: {tier.razorpayPlanId}
                      </div>
                    ) : null}
                  </CardContent>
                  <div className="flex items-center justify-between border-t border-border/60 p-3 pt-2">
                    <form
                      action={async () => {
                        "use server"
                        await toggleTierStatus(tier.id, tier.isActive)
                      }}
                    >
                      <Button variant="ghost" size="xs" type="submit" className="gap-1 text-[11px]">
                        <Power className="size-3" />
                        {tier.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </form>

                    <form
                      action={async () => {
                        "use server"
                        await deleteTier(tier.id)
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="xs"
                        type="submit"
                        className="text-destructive hover:bg-destructive/10 text-[11px] gap-1"
                      >
                        <Trash2 className="size-3" /> Delete
                      </Button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
