import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { RazorpayCheckoutButton } from "@/components/razorpay-checkout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/brand-logo"
import { Check, ShieldCheck, Clock, Zap } from "lucide-react"

type InvitePageProps = {
  params: Promise<{ slug: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { slug } = await params

  const link = await prisma.clientLink.findUnique({
    where: { slug },
    include: {
      freelancer: true,
      tier: true,
    },
  })

  if (!link || !link.tier) {
    notFound()
  }

  const { freelancer, tier } = link
  const priceFormatted = formatCurrency(tier.priceInPaise)

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-between">
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:px-12">
        <BrandLogo size="sm" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Badge
              variant="outline"
              className="mb-3 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
            >
              Private Retainer Invitation
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Work with {freelancer.name || "your Freelancer"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Lock in dedicated monthly availability and unlock your collaborative client portal.
            </p>
          </div>

          <Card className="border-border shadow-xl bg-card overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {tier.description || "Dedicated monthly retainer package"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-foreground">
                    {priceFormatted}
                  </span>
                  <span className="text-xs text-muted-foreground block">/month</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg bg-muted/50 p-4 border border-border/60 space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <Clock className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{tier.monthlyHours} hours of dedicated work per month</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <Zap className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Priority task turnaround in private queue</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Automated recurring monthly subscription via Razorpay</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Included with your client portal
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500" />
                    Submit new requests anytime directly to the queue
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500" />
                    Real-time remaining hours and logged time transparency
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500" />
                    Download deliverables and assets directly from cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-500" />
                    Manage or cancel anytime with single-click simplicity
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              {link.isUsed ? (
                <div className="w-full rounded-lg bg-amber-500/10 p-3 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
                  This invite link has already been claimed.
                </div>
              ) : (
                <RazorpayCheckoutButton
                  slug={slug}
                  tierName={tier.name}
                  priceFormatted={priceFormatted}
                  clientEmail={link.clientEmail}
                />
              )}
              <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5 text-muted-foreground" />
                Secured by Razorpay. Cancel anytime before next renewal.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AuraFlow. Powered by Razorpay Subscriptions.
      </footer>
    </div>
  )
}
