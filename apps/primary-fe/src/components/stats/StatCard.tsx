import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  accentBorder?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  accentBorder,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden',
        accentBorder && 'border-l-2 border-l-[hsl(var(--foreground))]',
        className
      )}
    >
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="font-stat text-2xl sm:text-3xl font-semibold tracking-tight">{value}</p>
            {(description || trend) && (
              <p className="text-xs text-muted-foreground">
                {trend && (
                  <span
                    className={cn(
                      'mr-1 font-medium',
                      trend.isPositive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'
                    )}
                  >
                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                )}
                {description}
              </p>
            )}
          </div>
          <div className="rounded-md bg-[hsl(var(--background-subtle))] p-2 sm:p-2.5">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton loader for stat cards
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-3 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
