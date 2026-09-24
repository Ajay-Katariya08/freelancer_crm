"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createRazorpayPlan } from "@/lib/razorpay"
import { z } from "zod"

const tierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  monthlyHours: z.coerce.number().min(1, "Must offer at least 1 hour"),
  priceInRupees: z.coerce.number().min(100, "Price must be at least ₹100"),
})

export type CreateTierState = {
  success?: boolean
  error?: string
}

export async function createTier(
  prevState: CreateTierState | null,
  formData: FormData
): Promise<CreateTierState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const validated = tierSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    monthlyHours: formData.get("monthlyHours"),
    priceInRupees: formData.get("priceInRupees"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" }
  }

  const { name, description, monthlyHours, priceInRupees } = validated.data
  const priceInPaise = Math.round(priceInRupees * 100)

  let razorpayPlanId: string | undefined = undefined

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const plan = await createRazorpayPlan({
        name,
        description,
        amountInPaise: priceInPaise,
      })
      razorpayPlanId = plan.id
    } catch (e: any) {
      console.error("Razorpay plan creation error:", e)
    }
  }

  try {
    await prisma.retainerTier.create({
      data: {
        freelancerId: session.user.id,
        name,
        description: description || null,
        monthlyHours,
        priceInPaise,
        razorpayPlanId: razorpayPlanId || null,
      },
    })

    revalidatePath("/dashboard/freelancer/tiers")
    revalidatePath("/dashboard/freelancer")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to save tier" }
  }
}

export async function toggleTierStatus(tierId: string, currentStatus: boolean) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.retainerTier.updateMany({
    where: { id: tierId, freelancerId: session.user.id },
    data: { isActive: !currentStatus },
  })

  revalidatePath("/dashboard/freelancer/tiers")
}

export async function deleteTier(tierId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.retainerTier.deleteMany({
    where: { id: tierId, freelancerId: session.user.id },
  })

  revalidatePath("/dashboard/freelancer/tiers")
}
