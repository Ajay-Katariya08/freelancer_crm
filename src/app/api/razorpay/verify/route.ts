import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpaySubscriptionSignature,
} from "@/lib/razorpay"
import { sendEmail } from "@/lib/resend"
import { SubscriptionConfirmedEmail } from "@/components/emails/subscription-confirmed"
import { formatCurrency } from "@/lib/utils"
import { addMonths } from "date-fns"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { slug, paymentId, orderId, subscriptionId, signature } = await req.json()
    const identifier = orderId || subscriptionId
    if (!slug || !paymentId || !identifier || !signature) {
      return NextResponse.json({ error: "Missing required verification data" }, { status: 400 })
    }

    const isValid = orderId
      ? verifyRazorpayPaymentSignature({ orderId, paymentId, signature })
      : verifyRazorpaySubscriptionSignature({ subscriptionId: identifier, paymentId, signature })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    const link = await prisma.clientLink.findUnique({
      where: { slug },
      include: {
        freelancer: true,
        tier: true,
      },
    })

    if (!link || !link.tier) {
      return NextResponse.json({ error: "Invite link or tier not found" }, { status: 404 })
    }

    const session = await auth()
    let clientId = session?.user?.id

    if (!clientId && link.clientEmail) {
      let clientUser = await prisma.user.findUnique({
        where: { email: link.clientEmail },
      })
      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email: link.clientEmail,
            role: "CLIENT",
          },
        })
      } else if (clientUser.role !== "CLIENT") {
        await prisma.user.update({
          where: { id: clientUser.id },
          data: { role: "CLIENT" },
        })
      }
      clientId = clientUser.id
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Please log in or sign up to finalize subscription linkage" },
        { status: 401 }
      )
    }

    await prisma.user.update({
      where: { id: clientId },
      data: { role: "CLIENT" },
    })

    const startDate = new Date()
    const endDate = addMonths(startDate, 1)

    const sub = await prisma.subscription.upsert({
      where: { razorpaySubscriptionId: identifier },
      update: {
        status: "ACTIVE",
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
      },
      create: {
        clientId,
        freelancerId: link.freelancerId,
        tierId: link.tier.id,
        razorpaySubscriptionId: identifier,
        status: "ACTIVE",
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        hoursUsed: 0,
      },
      include: {
        client: true,
        freelancer: true,
        tier: true,
      },
    })

    await prisma.clientLink.update({
      where: { id: link.id },
      data: { isUsed: true },
    })

    if (sub.client.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      await sendEmail({
        to: sub.client.email,
        subject: `Your retainer subscription with ${sub.freelancer.name || "Freelancer"} is active!`,
        react: SubscriptionConfirmedEmail({
          clientName: sub.client.name || "Valued Client",
          freelancerName: sub.freelancer.name || "Your Freelancer",
          tierName: sub.tier.name,
          monthlyHours: sub.tier.monthlyHours,
          priceFormatted: formatCurrency(sub.tier.priceInPaise),
          portalUrl: `${appUrl}/dashboard/client`,
        }),
      })
    }

    return NextResponse.json({ success: true, subscriptionId: sub.id })
  } catch (error: any) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: error.message || "Failed to verify subscription" }, { status: 500 })
  }
}
