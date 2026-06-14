import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCardColor = "teal" | "sky" | "amber" | "emerald" | "rose"

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isUp: boolean
  }
  color?: StatCardColor
  className?: string
}

const colorStyles: Record<
  StatCardColor,
  {
    bg: string
    iconBg: string
    icon: string
  }
> = {
  teal: {
    bg: "from-teal-50 to-teal-100/60 border-teal-200",
    iconBg: "bg-teal-500/10",
    icon: "text-teal-600",
  },
  sky: {
    bg: "from-sky-50 to-sky-100/60 border-sky-200",
    iconBg: "bg-sky-500/10",
    icon: "text-sky-600",
  },
  amber: {
    bg: "from-amber-50 to-amber-100/60 border-amber-200",
    iconBg: "bg-amber-500/10",
    icon: "text-amber-600",
  },
  emerald: {
    bg: "from-emerald-50 to-emerald-100/60 border-emerald-200",
    iconBg: "bg-emerald-500/10",
    icon: "text-emerald-600",
  },
  rose: {
    bg: "from-rose-50 to-rose-100/60 border-rose-200",
    iconBg: "bg-rose-500/10",
    icon: "text-rose-600",
  },
}

const trendColor = (isUp: boolean) =>
  isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "teal",
  className,
}) => {
  const styles = colorStyles[color]

  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-all duration-300",
        styles.bg,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                  trendColor(trend.isUp),
                )}
              >
                {trend.isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500">较上期</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center rounded-xl p-3",
            styles.iconBg,
          )}
        >
          <Icon className={cn("h-6 w-6", styles.icon)} />
        </div>
      </div>
    </div>
  )
}

StatCard.displayName = "StatCard"

export { StatCard }
