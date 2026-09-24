import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.includes("verify-request")) {
    return NextResponse.redirect(new URL("/login/verify-request", request.url))
  }
  return NextResponse.redirect(new URL("/login", request.url))
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url))
}
