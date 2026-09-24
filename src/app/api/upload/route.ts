import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename") || "deliverable"

  if (!request.body) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
    })
    return NextResponse.json(blob)
  } catch (error: any) {
    console.error("Vercel Blob error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to upload file to Blob store" },
      { status: 500 }
    )
  }
}
