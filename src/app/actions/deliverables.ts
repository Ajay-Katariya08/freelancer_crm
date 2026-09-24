"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/resend"
import { DeliverableUploadedEmail } from "@/components/emails/deliverable-uploaded"
import { z } from "zod"

const deliverableSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription required"),
  taskId: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  fileUrl: z.string().url("Valid file URL required").optional().or(z.literal("")),
  fileName: z.string().optional(),
  fileSize: z.coerce.number().optional(),
})

export type CreateDeliverableState = {
  success?: boolean
  error?: string
}

export async function createDeliverable(
  prevState: CreateDeliverableState | null,
  formData: FormData
): Promise<CreateDeliverableState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const validated = deliverableSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    taskId: formData.get("taskId") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    fileUrl: formData.get("fileUrl") || undefined,
    fileName: formData.get("fileName") || undefined,
    fileSize: formData.get("fileSize") || undefined,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" }
  }

  const { subscriptionId, taskId, title, description, fileUrl, fileName, fileSize } =
    validated.data

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { client: true },
    })

    if (!subscription || subscription.freelancerId !== session.user.id) {
      return { error: "Subscription not found" }
    }

    const deliverable = await prisma.deliverable.create({
      data: {
        subscriptionId,
        taskId: taskId || null,
        clientId: subscription.clientId,
        title,
        description: description || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      },
    })

    if (subscription.client.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      await sendEmail({
        to: subscription.client.email,
        subject: `New deliverable ready: ${deliverable.title}`,
        react: DeliverableUploadedEmail({
          clientName: subscription.client.name || "Client",
          freelancerName: session.user.name || "Your Freelancer",
          deliverableTitle: deliverable.title,
          deliverableDescription: deliverable.description,
          fileUrl: deliverable.fileUrl,
          portalUrl: `${appUrl}/dashboard/client/deliverables`,
        }),
      })
    }

    revalidatePath(`/dashboard/freelancer/clients/${subscription.clientId}`)
    revalidatePath("/dashboard/client/deliverables")
    revalidatePath("/dashboard/client")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create deliverable" }
  }
}
