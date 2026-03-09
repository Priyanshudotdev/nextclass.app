import { cn, formatRelativeTime } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPlus, Upload, CalendarCheck, Megaphone, BookOpen } from 'lucide-react'
import type { ActivityType, Activity } from '@/types'

const activityIcons: Record<ActivityType, React.ElementType> = {
  STUDENT_JOIN: UserPlus,
  RESOURCE_UPLOAD: Upload,
  ATTENDANCE: CalendarCheck,
  ANNOUNCEMENT: Megaphone,
  ENROLLMENT: BookOpen,
}

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] || CalendarCheck

  return (
    <div className="flex gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--background-muted))]">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {activity.user && <span className="font-medium">{activity.user.name}</span>}{' '}
          <span className="text-muted-foreground">{activity.description}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}

interface ActivityFeedProps {
  activities: Activity[]
  maxHeight?: string
  showViewAll?: boolean
  onViewAll?: () => void
  className?: string
}

export function ActivityFeed({
  activities,
  maxHeight = '400px',
  showViewAll = true,
  onViewAll,
  className,
}: ActivityFeedProps) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Recent Activity</h3>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View All
          </button>
        )}
      </div>
      <ScrollArea style={{ maxHeight }} className="p-4">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="divide-y">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Skeleton loader
export function ActivityFeedSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
