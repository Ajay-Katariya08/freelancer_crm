"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import { sendEmail } from "@/lib/resend"
import { InviteLinkEmail } from "@/components/emails/invite-link"
import { formatCurrency } from "@/lib/utils"

export type GenerateLinkState = {
  success?: boolean
  error?: string
  linkUrl?: string
}

export async function generateClientLink(
  prevState: GenerateLinkState | null,
  formData: FormData
): Promise<GenerateLinkState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const tierId = formData.get("tierId") as string
  const clientEmail = (formData.get("clientEmail") as string)?.trim() || null

  const slug = nanoid(10)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const inviteUrl = `${appUrl}/invite/${slug}`

  try {
    const tier = tierId
      ? await prisma.retainerTier.findFirst({
          where: { id: tierId, freelancerId: session.user.id },
        })
      : null

    await prisma.clientLink.create({
      data: {
        slug,
        freelancerId: session.user.id,
        tierId: tier?.id || null,
        clientEmail: clientEmail || null,
      },
    })

    if (clientEmail) {
      await sendEmail({
        to: clientEmail,
        subject: `${session.user.name || "A Freelancer"} invited you to a monthly retainer`,
        react: InviteLinkEmail({
          freelancerName: session.user.name || "Your Freelancer",
          tierName: tier?.name,
          monthlyHours: tier?.monthlyHours,
          priceFormatted: tier ? formatCurrency(tier.priceInPaise) : undefined,
          inviteUrl,
        }),
      })
    }

    revalidatePath("/dashboard/freelancer/links")
    return { success: true, linkUrl: inviteUrl }
  } catch (error: any) {
    return { error: error.message || "Failed to generate link" }
  }
}

export async function deleteClientLink(linkId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.clientLink.deleteMany({
    where: { id: linkId, freelancerId: session.user.id },
  })

  revalidatePath("/dashboard/freelancer/links")
}
