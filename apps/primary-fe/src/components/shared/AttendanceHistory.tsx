import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface AttendanceRecord {
  date: string
  percentage?: number
  entries?: { subject: string; status: 'present' | 'absent' | 'late' }[]
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
  month: Date
  onMonthChange: (date: Date) => void
  className?: string
}

export function AttendanceHistory({
  records,
  month,
  onMonthChange,
  className,
}: AttendanceHistoryProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  
  const handlePrevMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }
  
  const handleNextMonth = () => {
    const newDate = new Date(month)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  // Generate calendar days
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const startPadding = (firstDay.getDay() + 6) % 7 // Adjust for Monday start
  const totalDays = lastDay.getDate()
  
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) calendarDays.push(null)
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i)
  
  const getRecordForDay = (day: number) => {
    const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return records.find(r => r.date === dateStr)
  }

  const getStatusColor = (percentage?: number) => {
    if (percentage === undefined) return ''
    if (percentage >= 85) return 'bg-emerald-500'
    if (percentage >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const today = new Date()
  const isToday = (day: number) => {
    return (
      month.getFullYear() === today.getFullYear() &&
      month.getMonth() === today.getMonth() &&
      day === today.getDate()
    )
  }

  const isFuture = (day: number) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    return date > today
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{monthName}</span>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const record = day ? getRecordForDay(day) : null
            const future = day ? isFuture(day) : false

            return (
              <div
                key={index}
                className={cn(
                  'relative flex h-12 items-center justify-center border-b border-r text-sm',
                  index % 7 === 6 && 'border-r-0',
                  Math.floor(index / 7) === Math.floor((calendarDays.length - 1) / 7) && 'border-b-0',
                  !day && 'bg-muted/20',
                  future && 'text-muted-foreground/50',
                  isToday(day || 0) && 'bg-muted/50 font-semibold'
                )}
              >
                {day && (
                  <>
                    {record && !future ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex h-full w-full flex-col items-center justify-center gap-0.5 hover:bg-muted/50">
                            <span>{day}</span>
                            {record.percentage !== undefined && (
                              <div className="flex items-center gap-1">
                                <div className={cn('h-1.5 w-1.5 rounded-full', getStatusColor(record.percentage))} />
                                <span className="text-[10px] text-muted-foreground">
                                  {record.percentage}%
                                </span>
                              </div>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-3">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              {new Date(month.getFullYear(), month.getMonth(), day).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            {record.entries?.map((entry, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span>{entry.subject}</span>
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    entry.status === 'present' && 'text-emerald-600',
                                    entry.status === 'absent' && 'text-red-600',
                                    entry.status === 'late' && 'text-amber-600'
                                  )}
                                >
                                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                </span>
                              </div>
                            ))}
                            {record.percentage !== undefined && !record.entries && (
                              <p className="text-sm text-muted-foreground">
                                Attendance: {record.percentage}%
                              </p>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span>{day}</span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">&gt;85%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">60-85%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">&lt;60%</span>
        </div>
      </div>
    </div>
  )
}
