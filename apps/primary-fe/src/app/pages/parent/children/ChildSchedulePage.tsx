import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextType {
  child: { id: string; name: string; batch: string; rollNo: string; grade: string }
}

const mockSchedule = {
  c1: {
    today: [
      { id: 1, time: '09:00 AM', subject: 'Physics', teacher: 'Rahul Sir', room: 'Room 101', status: 'completed' },
      { id: 2, time: '10:30 AM', subject: 'Chemistry', teacher: 'Mehta Sir', room: 'Lab 2', status: 'completed' },
      { id: 3, time: '12:00 PM', subject: 'Break', teacher: '', room: '', status: 'completed' },
      { id: 4, time: '01:00 PM', subject: 'Biology', teacher: 'Priya Ma\'am', room: 'Room 103', status: 'ongoing' },
      { id: 5, time: '02:30 PM', subject: 'English', teacher: 'Sharma Sir', room: 'Room 102', status: 'upcoming' },
    ],
    weekly: [
      { day: 'Monday', classes: 5 },
      { day: 'Tuesday', classes: 4 },
      { day: 'Wednesday', classes: 5 },
      { day: 'Thursday', classes: 4 },
      { day: 'Friday', classes: 5 },
      { day: 'Saturday', classes: 3 },
    ],
  },
  c2: {
    today: [
      { id: 1, time: '09:00 AM', subject: 'Mathematics', teacher: 'Sharma Sir', room: 'Room 201', status: 'completed' },
      { id: 2, time: '10:30 AM', subject: 'Science', teacher: 'Verma Ma\'am', room: 'Lab 1', status: 'completed' },
      { id: 3, time: '12:00 PM', subject: 'Break', teacher: '', room: '', status: 'completed' },
      { id: 4, time: '01:00 PM', subject: 'English', teacher: 'Gupta Ma\'am', room: 'Room 202', status: 'ongoing' },
      { id: 5, time: '02:30 PM', subject: 'Social Studies', teacher: 'Singh Sir', room: 'Room 203', status: 'upcoming' },
    ],
    weekly: [
      { day: 'Monday', classes: 5 },
      { day: 'Tuesday', classes: 5 },
      { day: 'Wednesday', classes: 4 },
      { day: 'Thursday', classes: 5 },
      { day: 'Friday', classes: 4 },
      { day: 'Saturday', classes: 0 },
    ],
  },
}

export function ChildSchedulePage() {
  const { child } = useOutletContext<ContextType>()
  const schedule = mockSchedule[child.id as keyof typeof mockSchedule] || mockSchedule.c1

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Today's Schedule */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-medium">Today's Schedule</CardTitle>
          <p className="text-sm text-muted-foreground">{today}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.today.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4',
                  item.status === 'ongoing' && 'border-foreground bg-muted/30'
                )}
              >
                {/* Time */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{item.time}</span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.subject}</span>
                    {item.status === 'ongoing' && (
                      <Badge className="bg-success text-success-foreground">Ongoing</Badge>
                    )}
                    {item.status === 'completed' && (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                  </div>
                  {item.teacher && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.teacher}</p>
                  )}
                </div>

                {/* Room */}
                {item.room && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {item.room}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.weekly.map((day) => {
              const isToday = day.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
              return (
                <div
                  key={day.day}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3',
                    isToday ? 'bg-muted' : 'border'
                  )}
                >
                  <span className={cn('font-medium', isToday && 'text-foreground')}>
                    {day.day}
                    {isToday && <span className="ml-2 text-xs text-muted-foreground">(Today)</span>}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {day.classes} {day.classes === 1 ? 'class' : 'classes'}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
