import Razorpay from "razorpay"
import crypto from "crypto"

export function getRazorpayClient() {
  const key_id = (process.env.RAZORPAY_KEY_ID || "").trim()
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim()
  console.log(`[Razorpay Debug] Key ID: "${key_id}", Secret length: ${key_secret.length}`)
  return new Razorpay({ key_id, key_secret })
}

export const razorpay = getRazorpayClient()

export type CreatePlanParams = {
  name: string
  description?: string
  amountInPaise: number
}

export async function createRazorpayPlan({
  name,
  description,
  amountInPaise,
}: CreatePlanParams) {
  const client = getRazorpayClient()
  return await client.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name,
      amount: amountInPaise,
      currency: "INR",
      description: description || undefined,
    },
  })
}

export type CreateSubscriptionParams = {
  planId: string
  totalCount?: number
  customerNotify?: 1 | 0
}

export async function createRazorpaySubscription({
  planId,
  totalCount = 60,
  customerNotify = 1,
}: CreateSubscriptionParams) {
  const client = getRazorpayClient()
  return await client.subscriptions.create({
    plan_id: planId,
    total_count: totalCount,
    quantity: 1,
    customer_notify: customerNotify,
  })
}

export type CreateOrderParams = {
  amountInPaise: number
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder({
  amountInPaise,
  receipt,
  notes,
}: CreateOrderParams) {
  const client = getRazorpayClient()
  return await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes,
  })
}

export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET || ""
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex")

  return expectedSignature === signature
}

export function verifyRazorpaySubscriptionSignature({
  subscriptionId,
  paymentId,
  signature,
}: {
  subscriptionId: string
  paymentId: string
  signature: string
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET || ""
  const body = `${paymentId}|${subscriptionId}`
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex")

  return expectedSignature === signature
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ""
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")

  return expectedSignature === signature
}
