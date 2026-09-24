import * as React from "react"

type SubscriptionConfirmedEmailProps = {
  clientName: string
  freelancerName: string
  tierName: string
  monthlyHours: number
  priceFormatted: string
  portalUrl: string
}

export const SubscriptionConfirmedEmail: React.FC<SubscriptionConfirmedEmailProps> = ({
  clientName,
  freelancerName,
  tierName,
  monthlyHours,
  priceFormatted,
  portalUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827", lineHeight: "1.5" }}>
    <h2 style={{ color: "#4f46e5" }}>Subscription Confirmed!</h2>
    <p>Hi {clientName},</p>
    <p>
      Your monthly retainer with <strong>{freelancerName}</strong> is now active.
    </p>
    <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", margin: "16px 0" }}>
      <p style={{ margin: "4px 0" }}><strong>Plan:</strong> {tierName}</p>
      <p style={{ margin: "4px 0" }}><strong>Monthly Hours:</strong> {monthlyHours} hrs</p>
      <p style={{ margin: "4px 0" }}><strong>Price:</strong> {priceFormatted}/month</p>
    </div>
    <p>You can now submit tasks and track progress directly from your client portal:</p>
    <a
      href={portalUrl}
      style={{
        display: "inline-block",
        background: "#4f46e5",
        color: "#ffffff",
        padding: "10px 20px",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      Go to Client Portal
    </a>
  </div>
)
