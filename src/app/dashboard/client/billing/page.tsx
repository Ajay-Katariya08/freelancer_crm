import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cancelClientSubscription } from "@/app/actions/billing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar, Clock, ShieldAlert } from "lucide-react"

export default async function ClientBillingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "FREELANCER") redirect("/dashboard/freelancer")

  const subscription = await prisma.subscription.findFirst({
    where: { clientId: session.user.id },
    include: {
      freelancer: true,
      tier: true,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!subscription) {
    redirect("/dashboard/client")
  }

  const { tier, freelancer } = subscription

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Plan & Billing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review your active retainer terms and subscription management.
        </p>
      </div>

      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Active retainer with {freelancer.name || freelancer.email}
              </CardDescription>
            </div>
            <Badge
              variant={subscription.status === "ACTIVE" ? "default" : "secondary"}
              className="text-xs"
            >
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-3.5" /> Recurring Rate
              </span>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(tier.priceInPaise)}
                <span className="text-xs text-muted-foreground font-normal"> / month</span>
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5" /> Monthly Quota
              </span>
              <p className="text-lg font-bold text-foreground">{tier.monthlyHours} hours</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Next Renewal Date
              </span>
              <p className="text-base font-bold text-foreground">
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground">Payment Processor Details</p>
            <p>
              Subscription ID: <code className="font-mono text-[11px]">{subscription.razorpaySubscriptionId}</code>
            </p>
            <p>
              Managed seamlessly through Razorpay recurring autopay. Cards are automatically billed on each billing cycle.
            </p>
          </div>
        </CardContent>

        {subscription.status === "ACTIVE" ? (
          <CardFooter className="border-t border-border/60 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-amber-500 shrink-0" />
              <span>Cancelling stops future autopay renewals immediately.</span>
            </div>
            <form
              action={async () => {
                "use server"
                await cancelClientSubscription(subscription.id)
              }}
            >
              <SubmitButton
                variant="outline"
                size="sm"
                pendingText="Cancelling..."
                className="text-destructive hover:bg-destructive/10 text-xs"
              >
                Cancel Retainer Subscription
              </SubmitButton>
            </form>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
