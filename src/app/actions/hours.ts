"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const hourLogSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription required"),
  taskId: z.string().optional(),
  hours: z.coerce.number().min(0.25, "Minimum 0.25 hours (15 mins)").max(24),
  description: z.string().optional(),
})

export type LogHoursState = {
  success?: boolean
  error?: string
}

export async function logHours(
  prevState: LogHoursState | null,
  formData: FormData
): Promise<LogHoursState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const validated = hourLogSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    taskId: formData.get("taskId") || undefined,
    hours: formData.get("hours"),
    description: formData.get("description"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" }
  }

  const { subscriptionId, taskId, hours, description } = validated.data

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    })

    if (!subscription || subscription.freelancerId !== session.user.id) {
      return { error: "Subscription not found" }
    }

    await prisma.$transaction([
      prisma.hourLog.create({
        data: {
          subscriptionId,
          taskId: taskId || null,
          hours,
          description: description || null,
        },
      }),
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          hoursUsed: { increment: hours },
        },
      }),
    ])

    revalidatePath(`/dashboard/freelancer/clients/${subscription.clientId}`)
    revalidatePath("/dashboard/freelancer/clients")
    revalidatePath("/dashboard/freelancer")
    revalidatePath("/dashboard/client")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to log hours" }
  }
}
