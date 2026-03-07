import { cn } from '@/lib/utils'

interface AttendanceCalendarProps {
  month: string
  data: { day: number; status: 'present' | 'absent' | 'holiday' | 'none' }[]
  className?: string
}

export function AttendanceCalendar({
  month,
  data,
  className,
}: AttendanceCalendarProps) {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium">{month}</h4>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {data.map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded text-xs',
              item.status === 'present' && 'bg-emerald-500/20 text-emerald-600',
              item.status === 'absent' && 'bg-red-500/20 text-red-600',
              item.status === 'holiday' && 'bg-muted text-muted-foreground',
              item.status === 'none' && 'text-transparent'
            )}
          >
            {item.day > 0 ? item.day : ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-emerald-500/20" />
          <span className="text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-red-500/20" />
          <span className="text-muted-foreground">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-muted" />
          <span className="text-muted-foreground">Holiday</span>
        </div>
      </div>
    </div>
  )
}
