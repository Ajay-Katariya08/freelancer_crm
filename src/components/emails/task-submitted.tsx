import * as React from "react"

type TaskSubmittedEmailProps = {
  clientName: string
  clientEmail: string
  taskTitle: string
  taskDescription?: string | null
  dashboardUrl: string
}

export const TaskSubmittedEmail: React.FC<TaskSubmittedEmailProps> = ({
  clientName,
  clientEmail,
  taskTitle,
  taskDescription,
  dashboardUrl,
}) => (
  <div style={{ fontFamily: "sans-serif", padding: "20px", color: "#111827", lineHeight: "1.5" }}>
    <h2 style={{ color: "#4f46e5" }}>New Task Submitted</h2>
    <p>
      <strong>{clientName}</strong> ({clientEmail}) has submitted a new task to your queue.
    </p>
    <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "8px", margin: "16px 0" }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{taskTitle}</h3>
      {taskDescription ? <p style={{ margin: 0, color: "#4b5563" }}>{taskDescription}</p> : null}
    </div>
    <a
      href={dashboardUrl}
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
      View in Dashboard
    </a>
  </div>
)
