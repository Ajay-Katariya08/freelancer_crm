"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"

export async function cancelClientSubscription(subscriptionId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })

  if (
    !subscription ||
    (subscription.clientId !== session.user.id && subscription.freelancerId !== session.user.id)
  ) {
    throw new Error("Subscription not found or permission denied")
  }

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, false)
    } catch (e: any) {
      console.error("Razorpay subscription cancel error:", e)
    }
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED" },
  })

  revalidatePath("/dashboard/client/billing")
  revalidatePath("/dashboard/client")
  revalidatePath("/dashboard/freelancer/clients")
}
