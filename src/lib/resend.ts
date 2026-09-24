import { Resend } from "resend"

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || "re_placeholder_for_build"
  return new Resend(apiKey)
}

export const resend = getResendClient()

export { sendEmail } from "@/lib/email"
export type { SendEmailOptions as SendEmailParams } from "@/lib/email"
