import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleItemProps {
  time: string
  subject: string
  batch?: string
  room?: string
  status?: 'upcoming' | 'ongoing' | 'completed'
  className?: string
}

export function ScheduleItem({
  time,
  subject,
  batch,
  room,
  status = 'upcoming',
  className,
}: ScheduleItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-3 transition-colors',
        status === 'ongoing' && 'border-foreground/20 bg-foreground/5',
        status === 'completed' && 'opacity-60',
        className
      )}
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            status === 'ongoing' && 'bg-emerald-500',
            status === 'upcoming' && 'bg-amber-500',
            status === 'completed' && 'bg-muted-foreground'
          )}
        />
        <div className="mt-1 h-full w-px bg-border" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{subject}</h4>
          {status === 'ongoing' && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
              Now
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </span>
          {room && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {room}
            </span>
          )}
        </div>

        {batch && (
          <p className="text-xs text-muted-foreground">{batch}</p>
        )}
      </div>
    </div>
  )
}
