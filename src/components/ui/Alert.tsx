import * as React from "react"
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertVariant = "info" | "success" | "warning" | "danger"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantConfig: Record<
  AlertVariant,
  {
    wrapper: string
    icon: typeof Info
    iconClass: string
    title: string
    text: string
  }
> = {
  info: {
    wrapper: "bg-blue-50 border-blue-200",
    icon: Info,
    iconClass: "text-blue-600",
    title: "text-blue-900",
    text: "text-blue-800",
  },
  success: {
    wrapper: "bg-green-50 border-green-200",
    icon: CheckCircle,
    iconClass: "text-green-600",
    title: "text-green-900",
    text: "text-green-800",
  },
  warning: {
    wrapper: "bg-yellow-50 border-yellow-200",
    icon: AlertTriangle,
    iconClass: "text-yellow-600",
    title: "text-yellow-900",
    text: "text-yellow-800",
  },
  danger: {
    wrapper: "bg-red-50 border-red-200",
    icon: XCircle,
    iconClass: "text-red-600",
    title: "text-red-900",
    text: "text-red-800",
  },
}

const Alert: React.FC<AlertProps> = ({
  className,
  variant = "info",
  title,
  dismissible = false,
  onDismiss,
  children,
  ...props
}) => {
  const [visible, setVisible] = React.useState(true)
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div
      role="alert"
      className={cn(
        "flex w-full rounded-lg border p-4 shadow-sm transition-opacity duration-200",
        config.wrapper,
        className,
      )}
      {...props}
    >
      <div className="flex-shrink-0">
        <Icon className={cn("h-5 w-5", config.iconClass)} />
      </div>
      <div className="flex-1 ml-3">
        {title && (
          <h5 className={cn("text-sm font-semibold mb-1", config.title)}>
            {title}
          </h5>
        )}
        <div className={cn("text-sm", config.text)}>{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={cn(
            "flex-shrink-0 -mr-1.5 -mt-1.5 p-1.5 rounded-md transition-colors",
            "hover:bg-white/50",
            config.iconClass,
          )}
          aria-label="关闭提示"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

Alert.displayName = "Alert"

export { Alert }
