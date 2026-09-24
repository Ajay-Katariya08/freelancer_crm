import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
export type Role = "FREELANCER" | "CLIENT"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
}

export type Session = {
  user: SessionUser
}

export const auth = cache(async (): Promise<Session | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) return null

  let dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, email: true, name: true, image: true, role: true },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0],
        image:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null,
        role: "FREELANCER",
      },
      select: { id: true, email: true, name: true, image: true, role: true },
    })
  }

  return {
    user: dbUser,
  }
})

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
