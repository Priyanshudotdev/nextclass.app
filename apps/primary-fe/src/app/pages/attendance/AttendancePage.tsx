import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CalendarCheck,
  CalendarX,
  Users,
  Check,
  X,
  Clock,
  Save,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useBatches, useStudents, useAttendance, useCreateAttendance } from '@/hooks/useAdmin'
import { toast } from 'sonner'
import type { Batch, User, Attendance } from '@/api/admin.api'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | null

export function AttendancePage() {
  const { user } = useAuth()
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  // React Query hooks
  const { data: batchesData, isLoading: batchesLoading } = useBatches()
  const { data: studentsData, isLoading: studentsLoading } = useStudents()
  const { data: attendanceData } = useAttendance({ 
    batchId: selectedBatch || undefined,
    date: selectedDate 
  })
  const createAttendanceMutation = useCreateAttendance()

  const batches = batchesData || []
  const students = studentsData || []

  // Set default batch when batches load
  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].id)
    }
  }, [batches, selectedBatch])

  // Load existing attendance when batch/date changes
  useEffect(() => {
    if (!attendanceData) return
    const newAttendance: Record<string, AttendanceStatus> = {}
    attendanceData.forEach((record: Attendance) => {
      newAttendance[record.student.id] = record.status as AttendanceStatus
    })
    setAttendance(newAttendance)
  }, [attendanceData])

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, AttendanceStatus> = {}
    students.forEach((s: User) => {
      allPresent[s.id] = 'PRESENT'
    })
    setAttendance(allPresent)
  }

  const handleSubmit = async () => {
    if (!selectedBatch) {
      toast.error('Please select a batch')
      return
    }

    setIsSubmitting(true)
    try {
      // Submit attendance for each student
      const promises = Object.entries(attendance)
        .filter(([_, status]) => status !== null)
        .map(([studentId, status]) =>
          createAttendanceMutation.mutateAsync({
            studentId,
            batchId: selectedBatch,
            date: selectedDate,
            status: status as 'PRESENT' | 'ABSENT' | 'LATE',
          })
        )
      
      await Promise.all(promises)
      toast.success('Attendance saved successfully')
    } catch (err) {
      toast.error('Failed to save attendance')
    } finally {
      setIsSubmitting(false)
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'PRESENT').length
  const absentCount = Object.values(attendance).filter((s) => s === 'ABSENT').length
  const lateCount = Object.values(attendance).filter((s) => s === 'LATE').length
  const unmarkedCount = students.length - presentCount - absentCount - lateCount

  const isLoading = batchesLoading || studentsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTeacherOrAdmin ? 'Mark and manage attendance records.' : 'View your attendance history.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="font-stat text-2xl font-semibold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success)/0.1)]">
              <CalendarCheck className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="font-stat text-2xl font-semibold text-[hsl(var(--success))]">{presentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--destructive)/0.1)]">
              <CalendarX className="h-5 w-5 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="font-stat text-2xl font-semibold text-[hsl(var(--destructive))]">{absentCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unmarked</p>
              <p className="font-stat text-2xl font-semibold">{unmarkedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mark Attendance */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base font-semibold">Mark Attendance</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch: Batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isTeacherOrAdmin && (
                <div className="mb-4 flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark All Present
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || unmarkedCount === students.length}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              )}
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-50">Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: User) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                        <TableCell>
                          {isTeacherOrAdmin ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant={attendance[student.id] === 'PRESENT' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                  'h-8 w-8 p-0',
                                  attendance[student.id] === 'PRESENT' && 'bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]'
                                )}
                                onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={attendance[student.id] === 'ABSENT' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                  'h-8 w-8 p-0',
                                  attendance[student.id] === 'ABSENT' && 'bg-destructive hover:bg-destructive'
                                )}
                                onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Badge variant={attendance[student.id] === 'PRESENT' ? 'default' : 'secondary'}>
                                {attendance[student.id] || 'Not Marked'}
                              </Badge>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No students found. Select a batch to view students.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Present</span>
                  <Badge variant="default" className="bg-[hsl(var(--success))]">{presentCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Absent</span>
                  <Badge variant="destructive">{absentCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Late</span>
                  <Badge variant="secondary">{lateCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unmarked</span>
                  <Badge variant="outline">{unmarkedCount}</Badge>
                </div>
                {students.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Attendance Rate</span>
                      <span className="font-stat text-lg">
                        {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
