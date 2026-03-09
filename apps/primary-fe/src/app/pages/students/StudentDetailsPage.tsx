import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Pencil,
  UserX,
  UserMinus,
  Calendar,
  BookOpen,
  FolderOpen,
  Clock,
  BarChart2,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { getInitials } from '@/lib/utils'
import { useStudents, useEnrollments, useAttendance } from '@/hooks/useAdmin'

export function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('attendance')

  // Fetch real data
  const { data: students, isLoading: studentsLoading } = useStudents()
  const { data: allEnrollments, isLoading: enrollmentsLoading } = useEnrollments()
  const { data: allAttendance } = useAttendance({ studentId: id })

  // Find the specific student
  const student = students?.find(s => s.id === id)
  
  // Filter enrollments and attendance for this student
  const enrollments = allEnrollments?.filter(e => e.student.id === id) || []
  const attendanceRecords = allAttendance || []
  
  // Calculate stats from real data
  const attendanceCount = attendanceRecords?.length || 0
  const presentCount = attendanceRecords?.filter(a => a.status === 'PRESENT').length || 0
  const attendancePercent = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0

  // Loading state
  if (studentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Not found state
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Student Not Found</h2>
        <p className="text-muted-foreground">The student you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/students">Back to Students</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        backLink="/students"
        backLabel="Back to Students"
        rightContent={
          <>
            <Badge>{student.status}</Badge>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove from Batch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Profile Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{getInitials(student.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{student.name}</h1>
          <p className="text-sm text-muted-foreground">
            {enrollments && enrollments.length > 0 
              ? enrollments.map(e => e.batch.name).join(', ')
              : 'No batch enrollment'
            }
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className="font-mono text-2xl font-semibold">{attendancePercent}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Batches</p>
              <p className="font-mono text-2xl font-semibold">{enrollments?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resources</p>
              <p className="font-mono text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-mono text-2xl font-semibold">
                {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="space-y-6 p-5">
            {/* Personal Info */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Personal Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <span className="text-sm font-medium">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{student.email || '—'}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Academic Info */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Enrolled Batches</h3>
              {enrollmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">● {enrollment.batch.name}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.batch.course?.name || 'Course'}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{enrollment.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enrolled in any batch.</p>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Parent Info */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Parent Info</h3>
              <p className="text-sm text-muted-foreground">No parent linked.</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="font-mono text-4xl font-semibold">{attendancePercent}%</p>
                      <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Present: {presentCount} / {attendanceCount} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent History</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {attendanceRecords && attendanceRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.slice(0, 10).map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-muted-foreground">
                              {new Date(record.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </TableCell>
                            <TableCell>{record.subject?.name || '—'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  record.status === 'PRESENT'
                                    ? 'default'
                                    : record.status === 'LATE'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No attendance records yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab - V2 Placeholder */}
            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <BarChart2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Test results will appear here</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Performance tracking coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground py-8">No recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
