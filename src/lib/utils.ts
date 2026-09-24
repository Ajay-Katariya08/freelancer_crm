import { format } from "date-fns"

export { cn } from "cn"

export function formatCurrency(amountInPaise: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaise / 100)
}

export function formatDate(date: Date | string | number) {
  return format(new Date(date), "MMM d, yyyy")
}

export function formatDateTime(date: Date | string | number) {
  return format(new Date(date), "MMM d, yyyy h:mm a")
}

export function formatHours(hours: number) {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`
}
