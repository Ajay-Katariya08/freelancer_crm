import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"

export default function VerifyRequestPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-muted/20">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/login"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs" })}
        >
          <ArrowLeft className="size-4" /> Back to Sign In
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-5">
          <BrandLogo size="md" />
        </div>
        <Card className="border-border shadow-lg bg-card overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-500/5">
              <Mail className="size-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Check your email</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
              A sign-in link has been sent to your email address. Click the link to complete your login.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pb-8">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>The link will expire in 24 hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>If you don&apos;t see it, check your spam or promotions folder.</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full text-xs font-medium",
                })}
              >
                Use a different email
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
