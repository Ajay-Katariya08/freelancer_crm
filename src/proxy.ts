import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isFreelancerRoute = nextUrl.pathname.startsWith("/dashboard/freelancer")
  const isClientRoute = nextUrl.pathname.startsWith("/dashboard/client")

  if (isFreelancerRoute || isClientRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    const userRole = req.auth?.user?.role

    if (isFreelancerRoute && userRole === "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard/client", nextUrl.origin))
    }

    if (isClientRoute && userRole === "FREELANCER") {
      return NextResponse.redirect(new URL("/dashboard/freelancer", nextUrl.origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
