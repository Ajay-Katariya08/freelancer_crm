import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay"
import { SubscriptionStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const event = payload.event
    const subEntity = payload.payload?.subscription?.entity

    if (!subEntity?.id) {
      return NextResponse.json({ message: "No subscription entity in event" }, { status: 200 })
    }

    const razorpaySubscriptionId = subEntity.id

    switch (event) {
      case "subscription.authenticated":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: "AUTHENTICATED" },
        })
        break

      case "subscription.activated":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: {
            status: "ACTIVE",
            currentPeriodStart: subEntity.current_start
              ? new Date(subEntity.current_start * 1000)
              : new Date(),
            currentPeriodEnd: subEntity.current_end
              ? new Date(subEntity.current_end * 1000)
              : new Date(),
          },
        })
        break

      case "subscription.charged":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: {
            status: "ACTIVE",
            hoursUsed: 0,
            currentPeriodStart: subEntity.current_start
              ? new Date(subEntity.current_start * 1000)
              : new Date(),
            currentPeriodEnd: subEntity.current_end
              ? new Date(subEntity.current_end * 1000)
              : new Date(),
          },
        })
        break

      case "subscription.pending":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: "PENDING" },
        })
        break

      case "subscription.halted":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: "HALTED" },
        })
        break

      case "subscription.cancelled":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: "CANCELLED" },
        })
        break

      case "subscription.completed":
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId },
          data: { status: "COMPLETED" },
        })
        break

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 })
  }
}
