import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/api/orders"
import { ORDER_STATUS_LABELS } from "@/lib/api/orders"

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending:
    "bg-amber-500/15 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  confirmed:
    "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  cancelled:
    "bg-rose-500/15 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200",
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium",
        STATUS_CLASS[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
