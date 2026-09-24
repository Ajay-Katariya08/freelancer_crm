"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, ShieldCheck } from "lucide-react"

declare global {
  interface Window {
    Razorpay?: any
  }
}

type RazorpayCheckoutButtonProps = {
  slug: string
  tierName: string
  priceFormatted: string
  clientEmail?: string | null
}

export function RazorpayCheckoutButton({
  slug,
  tierName,
  priceFormatted,
  clientEmail,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const loadScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        return resolve(true)
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const res = await loadScript()
      if (!res) {
        toast.error("Failed to load Razorpay payment SDK.")
        setLoading(false)
        return
      }

      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Failed to initialize subscription")
        setLoading(false)
        return
      }


      const options = {
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: data.freelancerName || "Freelancer Retainer",
        description: `${tierName} Retainer Plan`,
        prefill: {
          email: clientEmail || data.clientEmail || undefined,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (paymentResponse: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                slug,
                paymentId: paymentResponse.razorpay_payment_id,
                orderId: paymentResponse.razorpay_order_id,
                signature: paymentResponse.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              toast.success("Subscription activated successfully!")
              router.push("/dashboard/client")
            } else {
              toast.error(verifyData.error || "Payment verification failed")
            }
          } catch {
            toast.error("Error verifying payment")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast.error("Something went wrong with checkout")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full shadow-lg shadow-primary/20 py-6 text-base font-semibold transition-all hover:scale-[1.01]"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 size-5 animate-spin" />
          Setting up subscription...
        </>
      ) : (
        <>
          <ShieldCheck className="mr-2 size-5" />
          Subscribe for {priceFormatted}/mo
        </>
      )}
    </Button>
  )
}
