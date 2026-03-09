import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface ActivityItem {
  id: string
  icon: LucideIcon
  title: string
  description?: string
  time: string
}

interface ActivityTimelineProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={item.id} className="relative flex gap-3 pb-4">
            {/* Vertical line */}
            {index < items.length - 1 && (
              <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
            )}
            {/* Icon */}
            <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {/* Content */}
            <div className="flex-1 space-y-0.5 pt-1">
              <p className="text-sm">{item.title}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
