import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { generateClientLink, deleteClientLink } from "@/app/actions/links"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Link2, Trash2, ExternalLink } from "lucide-react"

export default async function InviteLinksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/dashboard/client")

  const [tiers, links] = await Promise.all([
    prisma.retainerTier.findMany({
      where: { freelancerId: session.user.id, isActive: true },
    }),
    prisma.clientLink.findMany({
      where: { freelancerId: session.user.id },
      include: { tier: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Client Invite Links</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate dedicated links for prospective or current clients to subscribe to a retainer tier.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-xs lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Link2 className="size-4 text-indigo-500" /> Create Invite Link
            </CardTitle>
            <CardDescription className="text-xs">
              Select tier to generate a direct checkout link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tiers.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                You need at least one active retainer tier before generating client links.
              </div>
            ) : (
              <form
                action={async (formData: FormData) => {
                  "use server"
                  await generateClientLink(null, formData)
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="space-y-1">
                  <Label htmlFor="tierId" className="text-xs">Retainer Tier</Label>
                  <select
                    id="tierId"
                    name="tierId"
                    required
                    className="w-full rounded-md border border-input bg-transparent px-2.5 py-1.5 text-xs shadow-xs focus:ring-1 focus:ring-ring outline-none"
                  >
                    {tiers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({formatCurrency(t.priceInPaise)}/mo • {t.monthlyHours}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="clientEmail" className="text-xs">Client Email (Optional)</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    placeholder="client@company.com"
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    If provided, we will automatically send an invitation email via Resend.
                  </p>
                </div>

                <Button type="submit" size="sm" className="w-full font-medium text-xs shadow-xs">
                  Generate Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            Generated Links ({links.length})
          </h2>

          {links.length === 0 ? (
            <Card className="border-dashed border-border bg-transparent p-8 text-center text-xs text-muted-foreground">
              No invite links generated yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const fullUrl = `${appUrl}/invite/${link.slug}`
                return (
                  <Card key={link.id} className="border-border bg-card shadow-xs p-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {link.tier?.name || "Retainer Plan"}
                          </span>
                          <Badge
                            variant={link.isUsed ? "secondary" : "default"}
                            className="text-[10px]"
                          >
                            {link.isUsed ? "Claimed" : "Active"}
                          </Badge>
                        </div>
                        {link.clientEmail ? (
                          <p className="text-[11px] text-muted-foreground">
                            Sent to: {link.clientEmail}
                          </p>
                        ) : null}
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-sm">
                          {fullUrl}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: "outline", size: "xs", className: "text-[11px] gap-1" })}
                        >
                          Open <ExternalLink className="size-3" />
                        </a>

                        <form
                          action={async () => {
                            "use server"
                            await deleteClientLink(link.id)
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="xs"
                            type="submit"
                            className="text-destructive hover:bg-destructive/10 text-[11px]"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
