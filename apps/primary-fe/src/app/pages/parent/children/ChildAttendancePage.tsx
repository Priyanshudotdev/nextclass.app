import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttendanceHistory } from '@/components/shared/AttendanceHistory'

interface ContextType {
  child: { id: string; name: string; batch: string; rollNo: string; grade: string }
}

const mockAttendanceStats = {
  c1: { present: 45, absent: 3, total: 48, percentage: 93.75 },
  c2: { present: 28, absent: 2, total: 30, percentage: 93.33 },
}

// Mock attendance records
const mockAttendanceRecords = [
  { date: '2026-03-01', percentage: 100, entries: [{ subject: 'Physics', status: 'present' as const }, { subject: 'Chemistry', status: 'present' as const }] },
  { date: '2026-03-02', percentage: 100, entries: [{ subject: 'Biology', status: 'present' as const }, { subject: 'English', status: 'present' as const }] },
  { date: '2026-03-03', percentage: 50, entries: [{ subject: 'Physics', status: 'present' as const }, { subject: 'Chemistry', status: 'absent' as const }] },
  { date: '2026-03-04', percentage: 100, entries: [{ subject: 'Biology', status: 'present' as const }] },
  { date: '2026-03-05', percentage: 100, entries: [{ subject: 'Physics', status: 'present' as const }] },
  { date: '2026-03-06', percentage: 0, entries: [{ subject: 'Chemistry', status: 'absent' as const }] },
  { date: '2026-03-07', percentage: 100, entries: [{ subject: 'Biology', status: 'present' as const }] },
]

export function ChildAttendancePage() {
  const { child } = useOutletContext<ContextType>()
  const stats = mockAttendanceStats[child.id as keyof typeof mockAttendanceStats] || mockAttendanceStats.c1
  const [month, setMonth] = useState(new Date(2026, 2, 1)) // March 2026

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Stats Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold font-mono text-success">{stats.percentage.toFixed(0)}%</span>
            <span className="text-sm text-muted-foreground">Attendance Rate</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold font-mono text-success">{stats.present}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold font-mono text-destructive">{stats.absent}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-3xl font-bold font-mono">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calendar */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base font-medium">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHistory 
            records={mockAttendanceRecords} 
            month={month}
            onMonthChange={setMonth}
          />
        </CardContent>
      </Card>
    </div>
  )
}
