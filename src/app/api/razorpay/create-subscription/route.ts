import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createRazorpayOrder } from "@/lib/razorpay"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { slug } = await req.json()
    if (!slug) return NextResponse.json({ error: "Missing link slug" }, { status: 400 })

    const link = await prisma.clientLink.findUnique({
      where: { slug },
      include: {
        freelancer: true,
        tier: true,
      },
    })

    if (!link) return NextResponse.json({ error: "Invite link not found" }, { status: 404 })
    if (link.isUsed) return NextResponse.json({ error: "Invite link has already been used" }, { status: 400 })
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.json({ error: "Invite link has expired" }, { status: 400 })
    }

    if (!link.tier) {
      return NextResponse.json({ error: "No tier assigned to this link" }, { status: 400 })
    }

    const order = await createRazorpayOrder({
      amountInPaise: link.tier.priceInPaise,
      receipt: `rcpt_${link.slug.slice(0, 10)}`,
      notes: {
        tierId: link.tier.id,
        linkSlug: link.slug,
        freelancerId: link.freelancerId,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      freelancerName: link.freelancer.name || "Your Freelancer",
      clientEmail: link.clientEmail,
    })
  } catch (error: any) {
    console.error("Create subscription error:", error)
    const message =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Failed to create subscription"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
