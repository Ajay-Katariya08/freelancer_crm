import { auth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email"
import { MagicLinkEmail } from "@/components/emails/magic-link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BrandLogo } from "@/components/brand-logo"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  if (session?.user) {
    if (session.user.role === "CLIENT") {
      redirect("/dashboard/client")
    } else {
      redirect("/dashboard/freelancer")
    }
  }

  const { error } = await searchParams

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-muted/20">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs" })}>
          <ArrowLeft className="size-4" /> Back to Home
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" className="mb-3" />
          <h1 className="text-2xl font-bold tracking-tight">Sign in to AuraFlow</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Access your freelancer dashboard or client portal
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="border-border shadow-md bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-xs">
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <form
                action={async () => {
                  "use server"
                  const supabase = await createClient()
                  const headerList = await headers()
                  const origin =
                    headerList.get("origin") ||
                    process.env.NEXT_PUBLIC_APP_URL ||
                    "http://localhost:3000"
                  const { data } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${origin}/auth/callback`,
                    },
                  })
                  if (data?.url) redirect(data.url)
                }}
              >
                <SubmitButton
                  variant="outline"
                  className="w-full gap-2 text-xs font-medium"
                  pendingText="Connecting..."
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.2-1.9.4-2.7L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 7 10.4 7z"
                    />
                  </svg>
                  Google
                </SubmitButton>
              </form>

              <form
                action={async () => {
                  "use server"
                  const supabase = await createClient()
                  const headerList = await headers()
                  const origin =
                    headerList.get("origin") ||
                    process.env.NEXT_PUBLIC_APP_URL ||
                    "http://localhost:3000"
                  const { data } = await supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: {
                      redirectTo: `${origin}/auth/callback`,
                    },
                  })
                  if (data?.url) redirect(data.url)
                }}
              >
                <SubmitButton
                  variant="outline"
                  className="w-full gap-2 text-xs font-medium"
                  pendingText="Connecting..."
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </SubmitButton>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>

            <form
              action={async (formData: FormData) => {
                "use server"
                const email = formData.get("email") as string
                const adminClient = createAdminClient()
                const headerList = await headers()
                const origin =
                  headerList.get("origin") ||
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "http://localhost:3000"

                const { data, error } = await adminClient.auth.admin.generateLink({
                  type: "magiclink",
                  email,
                  options: {
                    redirectTo: `${origin}/auth/callback`,
                  },
                })

                if (error || !data?.properties) {
                  redirect(
                    `/login?error=${encodeURIComponent(
                      error?.message || "Failed to generate login link"
                    )}`
                  )
                }

                const tokenHash = data.properties.hashed_token
                const verifyUrl = tokenHash
                  ? `${origin}/auth/callback?token_hash=${tokenHash}&type=email`
                  : data.properties.action_link

                const emailResult = await sendEmail({
                  to: email,
                  subject: "Sign in to AuraFlow",
                  react: MagicLinkEmail({ url: verifyUrl }),
                  text: `Sign in to AuraFlow: ${verifyUrl}`,
                })

                if (!emailResult.success) {
                  redirect(
                    `/login?error=${encodeURIComponent(
                      emailResult.error?.message || "Failed to send email"
                    )}`
                  )
                }

                redirect("/login/verify-request")
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="h-10 text-sm"
                />
              </div>
              <SubmitButton
                pendingText="Sending Link..."
                className="w-full font-medium shadow-md shadow-primary/20"
              >
                Send Magic Link
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
