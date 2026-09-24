import * as React from "react"

type MagicLinkEmailProps = {
  url: string
  host?: string
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({ url, host = "AuraFlow" }) => (
  <div style={{ fontFamily: "sans-serif", padding: "24px", color: "#111827", lineHeight: "1.6", maxWidth: "560px", margin: "0 auto" }}>
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{ color: "#4f46e5", margin: "0 0 8px 0", fontSize: "22px" }}>Sign in to {host}</h2>
      <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>Click the button below to securely access your account.</p>
    </div>
    <div style={{ margin: "28px 0" }}>
      <a
        href={url}
        style={{
          display: "inline-block",
          background: "#4f46e5",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        Sign in to {host}
      </a>
    </div>
    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "32px" }}>
      If you did not request this link, you can safely ignore this email.
    </p>
  </div>
)
