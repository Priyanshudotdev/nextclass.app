import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  variant?: 'default' | 'highlight' | 'muted'
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        variant === 'default' && 'bg-card',
        variant === 'highlight' && 'bg-primary text-primary-foreground',
        variant === 'muted' && 'bg-muted/30',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wider',
              variant === 'highlight'
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p className="font-mono text-3xl font-bold">{value}</p>
          {subtitle && (
            <p
              className={cn(
                'text-sm',
                variant === 'highlight'
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-lg p-2',
              variant === 'highlight'
                ? 'bg-primary-foreground/10'
                : 'bg-muted'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                variant === 'highlight'
                  ? 'text-primary-foreground/70'
                  : 'text-muted-foreground'
              )}
            />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              'text-xs font-medium',
              trend.isPositive !== false ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {trend.isPositive !== false ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span
            className={cn(
              'text-xs',
              variant === 'highlight'
                ? 'text-primary-foreground/50'
                : 'text-muted-foreground'
            )}
          >
            {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
