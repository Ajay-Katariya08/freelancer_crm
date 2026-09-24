import { Resend } from "resend"

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY || "re_placeholder_for_build"
  return new Resend(apiKey)
}

export const resend = getResendClient()

export type SendEmailParams = {
  to: string
  subject: string
  react?: any
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, react, html, text }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) return { success: false, error: "RESEND_API_KEY missing" }

  const from = process.env.EMAIL_FROM || "FreelancerCRM <notifications@resend.dev>"

  try {
    const client = getResendClient()
    const payload: any = {
      from,
      to,
      subject,
    }
    if (react) payload.react = react
    if (html) payload.html = html
    if (text) payload.text = text

    const data = await client.emails.send(payload)
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
