import { Card, CardContent } from '../ui/card'
import { cn } from '../../lib/utils'

/**
 * Reference-style metric card: pure white, rounded-xl, soft shadow.
 * Icon top-left in solid light-colored circle with white icon.
 * Label = muted blue; value = large bold slate. Good spacing.
 */
const ICON_BG_COLORS = {
  orange: 'bg-[#FF7A45]',   // primary
  blue: 'bg-[#6B8CBE]',
  purple: 'bg-[#9B8BB5]',
  red: 'bg-[#D97B7B]',
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'orange',
  valueClassName = 'text-[#333C4E]',
  className,
  ...props
}) {
  const bgClass = ICON_BG_COLORS[iconBg] || ICON_BG_COLORS.orange
  return (
    <Card
      className={cn(
        'bg-card border border-border shadow-soft hover:shadow-soft-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white',
                bgClass
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={cn('text-2xl font-semibold tracking-tight', valueClassName)}>{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
