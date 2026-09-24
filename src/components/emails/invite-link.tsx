import * as React from "react"

type InviteLinkEmailProps = {
  freelancerName: string
  tierName?: string | null
  monthlyHours?: number | null
  priceFormatted?: string | null
  inviteUrl: string
}

export const InviteLinkEmail: React.FC<InviteLinkEmailProps> = ({
  freelancerName,
  tierName,
  monthlyHours,
  priceFormatted,
  inviteUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827", lineHeight: "1.5" }}>
    <h2 style={{ color: "#4f46e5" }}>You're Invited to Join a Retainer</h2>
    <p>
      <strong>{freelancerName}</strong> has invited you to set up a monthly retainer relationship.
    </p>
    {tierName ? (
      <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", margin: "16px 0" }}>
        <p style={{ margin: "4px 0" }}><strong>Selected Plan:</strong> {tierName}</p>
        {monthlyHours ? <p style={{ margin: "4px 0" }}><strong>Monthly Hours:</strong> {monthlyHours} hrs</p> : null}
        {priceFormatted ? <p style={{ margin: "4px 0" }}><strong>Price:</strong> {priceFormatted}/month</p> : null}
      </div>
    ) : null}
    <p>Click below to choose your plan, complete setup, and activate your client portal:</p>
    <a
      href={inviteUrl}
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
      Review & Activate Retainer
    </a>
  </div>
)
