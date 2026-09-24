import * as React from "react"

type DeliverableUploadedEmailProps = {
  clientName: string
  freelancerName: string
  deliverableTitle: string
  deliverableDescription?: string | null
  fileUrl?: string | null
  portalUrl: string
}

export const DeliverableUploadedEmail: React.FC<DeliverableUploadedEmailProps> = ({
  clientName,
  freelancerName,
  deliverableTitle,
  deliverableDescription,
  fileUrl,
  portalUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827", lineHeight: "1.5" }}>
    <h2 style={{ color: "#10b981" }}>New Deliverable Ready!</h2>
    <p>Hi {clientName},</p>
    <p>
      <strong>{freelancerName}</strong> has uploaded a new deliverable for your review.
    </p>
    <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", margin: "16px 0" }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{deliverableTitle}</h3>
      {deliverableDescription ? <p style={{ margin: 0, color: "#4b5563" }}>{deliverableDescription}</p> : null}
      {fileUrl ? (
        <p style={{ marginTop: "12px" }}>
          <a href={fileUrl} style={{ color: "#2563eb", textDecoration: "underline" }}>
            Direct Download Link
          </a>
        </p>
      ) : null}
    </div>
    <a
      href={portalUrl}
      style={{
        display: "inline-block",
        background: "#10b981",
        color: "#ffffff",
        padding: "10px 20px",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      Open Client Portal
    </a>
  </div>
)
