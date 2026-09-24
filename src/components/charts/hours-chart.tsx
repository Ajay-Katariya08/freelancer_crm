"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type HoursDataPoint = {
  name: string
  used: number
  remaining: number
}

type HoursChartProps = {
  data: HoursDataPoint[]
}

export function HoursChart({ data }: HoursChartProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted/40" />
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/40" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            className="text-xs fill-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-xs fill-muted-foreground"
            tickFormatter={(val) => `${val}h`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-popover p-2.5 shadow-lg">
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <div className="mt-1 space-y-0.5 text-xs">
                      <p className="text-indigo-500 font-medium">Used: {payload[0]?.value}h</p>
                      <p className="text-emerald-500 font-medium">Remaining: {payload[1]?.value}h</p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 10, fontSize: "12px" }}
          />
          <Bar dataKey="used" name="Hours Used" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="remaining" name="Hours Remaining" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
