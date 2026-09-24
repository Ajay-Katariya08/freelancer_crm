import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export default async function middleware(req: NextRequest) {
  const { supabaseResponse, user } = await updateSession(req)
  const { nextUrl } = req
  const isFreelancerRoute = nextUrl.pathname.startsWith("/dashboard/freelancer")
  const isClientRoute = nextUrl.pathname.startsWith("/dashboard/client")

  if (isFreelancerRoute || isClientRoute) {
    if (!user) {
      const loginUrl = new URL("/login", nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
