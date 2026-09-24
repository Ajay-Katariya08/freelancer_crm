import Link from "next/link";
import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand-logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  CreditCard,
  LineChart,
  Clock,
  Send,
  Briefcase,
  Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const dashboardLink =
    session?.user?.role === "CLIENT"
      ? "/dashboard/client"
      : "/dashboard/freelancer";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/85 px-4 md:px-12 backdrop-blur-md">
        <BrandLogo size="md" />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <Link
              href={dashboardLink}
              className={buttonVariants({
                variant: "default",
                className: "shadow-md shadow-primary/20",
              })}
            >
              Open Dashboard <ArrowRight className="ml-1.5 size-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-sm",
                })}
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "default",
                  className: "shadow-md shadow-primary/20",
                })}
              >
                Get Started <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-20 pb-28 md:px-12 md:pt-28 md:pb-30">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(0,0,0,0))]" />

          <div className="mx-auto max-w-5xl text-center">
            <Badge
              variant="outline"
              className="mb-6 inline-flex items-center gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary"
            >
              <Send className="size-3.5 text-primary" />
              No CRM clutter. Just direct recurring retainers.
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Turn One-Off Clients Into{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
                Predictable Monthly Retainers
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Generate a single private link. Your client selects a monthly
              tier, inputs their card with Razorpay, and immediately unlocks a
              private portal to submit tasks and track hours.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "w-full sm:w-auto  px-8 text-base font-semibold",
                })}
              >
                Start Free Retainer Manager{" "}
                <ArrowRight className="ml-2 size-5" />
              </Link>
              <a
                href="#how-it-works"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full sm:w-auto ",
                })}
              >
                See How It Works
              </a>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" /> Razorpay
                Recurring Autopay
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" /> Automated
                Client Portal
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />{" "}
                Deliverables on Vercel Blob
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" /> Real-time
                MRR Analytics
              </span>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-t border-border/80 bg-muted/30 py-20 px-4 md:px-12"
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works in 3 Steps
              </h2>
              <p className="mt-3 text-muted-foreground">
                No invoices to chase. No confusing multi-page signups.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold mb-2">
                    1
                  </div>
                  <CardTitle className="text-lg">
                    Create Retainer Tiers
                  </CardTitle>
                  <CardDescription>
                    Define monthly hours, pricing, and scope (e.g. 10 hrs/mo at
                    ₹25,000). Plans auto-sync with Razorpay.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold mb-2">
                    2
                  </div>
                  <CardTitle className="text-lg">Share Private Link</CardTitle>
                  <CardDescription>
                    Send your client a dedicated invite URL. They see tier
                    terms, insert payment info, and subscribe in seconds.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold mb-2">
                    3
                  </div>
                  <CardTitle className="text-lg">
                    Auto-Unlocked Portal
                  </CardTitle>
                  <CardDescription>
                    Client submits tasks with automatic Resend notifications.
                    You log hours and upload deliverables directly.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 md:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Scale
              </h2>
              <p className="mt-3 text-muted-foreground">
                Built specially for consultants, developers, designers, and
                tutors.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Razorpay Recurring Autopay
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cards are automatically charged every month with webhook sync
                  and zero manual invoice chasing.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <LineChart className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Projected MRR Analytics
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track monthly recurring revenue trends over time using
                  interactive Recharts charts.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Precise Hour Tracking
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Log billable hours against active tasks with real-time
                  remaining quota indicators.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Zap className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Vercel Blob Deliverables
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload completed code archives, documents, and design assets
                  straight to high-speed cloud storage.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Send className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Transactional Emails (Resend)
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Instant notifications whenever clients submit tasks or you
                  publish finished deliverables.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Shield className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Multi-Tenant Roles
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Strict boundary isolation powered by Auth.js and Supabase
                  PostgreSQL.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/80 bg-muted/40 py-20 px-4 md:px-12 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to secure steady client income?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Set up your first retainer tier in less than 2 minutes. Free while
              in beta.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "shadow-lg shadow-primary/20 px-8",
                })}
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-8 px-4 md:px-12 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} AuraFlow. Built for high-leverage
          freelancers.
        </p>
      </footer>
    </div>
  );
}
