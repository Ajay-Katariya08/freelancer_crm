"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskStatus } from "@prisma/client"
import { sendEmail } from "@/lib/resend"
import { TaskSubmittedEmail } from "@/components/emails/task-submitted"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
})

export type CreateTaskState = {
  success?: boolean
  error?: string
}

export async function createClientTask(
  prevState: CreateTaskState | null,
  formData: FormData
): Promise<CreateTaskState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const validated = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Invalid input" }
  }

  const subscription = await prisma.subscription.findFirst({
    where: { clientId: session.user.id, status: "ACTIVE" },
    include: { freelancer: true },
  })

  if (!subscription) {
    return { error: "No active retainer subscription found" }
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: validated.data.title,
        description: validated.data.description || null,
        clientId: session.user.id,
        freelancerId: subscription.freelancerId,
        subscriptionId: subscription.id,
      },
    })

    if (subscription.freelancer.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      await sendEmail({
        to: subscription.freelancer.email,
        subject: `New task from ${session.user.name || "Client"}: ${task.title}`,
        react: TaskSubmittedEmail({
          clientName: session.user.name || "Your Client",
          clientEmail: session.user.email || "",
          taskTitle: task.title,
          taskDescription: task.description,
          dashboardUrl: `${appUrl}/dashboard/freelancer/tasks`,
        }),
      })
    }

    revalidatePath("/dashboard/client/tasks")
    revalidatePath("/dashboard/client")
    revalidatePath("/dashboard/freelancer/tasks")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create task" }
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  })

  revalidatePath("/dashboard/freelancer/tasks")
  revalidatePath("/dashboard/client/tasks")
  revalidatePath("/dashboard/freelancer")
  revalidatePath("/dashboard/client")
}
