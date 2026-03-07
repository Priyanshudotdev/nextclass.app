import { cn } from '@/lib/utils'

interface ActivityItemProps {
  avatar?: string
  name: string
  action: string
  target?: string
  time: string
  className?: string
}

export function ActivityItem({
  avatar,
  name,
  action,
  target,
  time,
  className,
}: ActivityItemProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn('flex items-start gap-3 py-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm">
          <span className="font-medium">{name}</span>{' '}
          <span className="text-muted-foreground">{action}</span>
          {target && <span className="font-medium"> {target}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
