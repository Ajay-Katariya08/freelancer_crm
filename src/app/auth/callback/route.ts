import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { EmailOtpType } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null

  const supabase = await createClient()
  let userEmail: string | undefined
  let authError: string | undefined

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user?.email) {
      userEmail = data.user.email
    } else if (error) {
      authError = error.message
    }
  } else if (token_hash) {
    const otpType = type || "email"
    let { data, error } = await supabase.auth.verifyOtp({ token_hash, type: otpType })

    if (error && otpType !== "magiclink") {
      const retry = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" })
      if (!retry.error && retry.data?.user?.email) {
        data = retry.data
        error = null
      }
    }

    if (!error && data?.user?.email) {
      userEmail = data.user.email
    } else if (error) {
      authError = error.message
    }
  } else {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Authenticating...</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#090d16;color:#fff;}</style>
</head>
<body>
  <p>Completing secure sign-in...</p>
  <script>
    const hash = window.location.hash.substring(1);
    if (hash) {
      const p = new URLSearchParams(hash);
      const access_token = p.get('access_token');
      const refresh_token = p.get('refresh_token');
      if (access_token && refresh_token) {
        fetch('/auth/callback', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ access_token, refresh_token })
        }).then(r => r.json()).then(d => {
          if (d.success) {
            window.location.href = d.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer';
          } else {
            window.location.href = '/login?error=' + encodeURIComponent(d.error || 'auth_failed');
          }
        }).catch(() => {
          window.location.href = '/login?error=auth_failed';
        });
      } else {
        window.location.href = '/login?error=auth_failed';
      }
    } else {
      window.location.href = '/login?error=auth_failed';
    }
  </script>
</body>
</html>`
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    })
  }

  if (userEmail) {
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split("@")[0],
          role: "FREELANCER",
        },
      })
    }

    const redirectTarget =
      dbUser.role === "CLIENT" ? "/dashboard/client" : "/dashboard/freelancer"
    return NextResponse.redirect(new URL(redirectTarget, requestUrl.origin))
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent(authError || "auth_failed")}`,
      requestUrl.origin
    )
  )
}

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()
    const supabase = await createClient()
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error || !data.user?.email) {
      return NextResponse.json(
        { success: false, error: error?.message || "auth_failed" },
        { status: 400 }
      )
    }

    let dbUser = await prisma.user.findUnique({
      where: { email: data.user.email },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: data.user.email,
          name: data.user.email.split("@")[0],
          role: "FREELANCER",
        },
      })
    }

    return NextResponse.json({ success: true, role: dbUser.role })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "auth_failed" },
      { status: 400 }
    )
  }
}
