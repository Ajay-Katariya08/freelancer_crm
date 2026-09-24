import nodemailer from "nodemailer"
import { resend } from "@/lib/resend"
import { render } from "@react-email/render"

export type SendEmailOptions = {
  to: string
  subject: string
  react?: any
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, react, html, text }: SendEmailOptions) {
  const finalHtml = html || (react ? await render(react) : undefined)

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
        },
      })

      const info = await transporter.sendMail({
        from: `AuraFlow <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html: finalHtml,
        text,
      })

      return { success: true, data: info }
    } catch (err: any) {
      return { success: false, error: { message: err?.message || "Failed to send email via Gmail" } }
    }
  }

  const payload: any = {
    from: process.env.EMAIL_FROM || "AuraFlow <onboarding@resend.dev>",
    to,
    subject,
  }
  if (finalHtml) payload.html = finalHtml
  if (text) payload.text = text

  const resendResult = await resend.emails.send(payload)

  if (resendResult.error) {
    return { success: false, error: resendResult.error }
  }

  return { success: true, data: resendResult.data }
}
