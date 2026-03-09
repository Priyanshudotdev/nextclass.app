import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Users,
  Calendar,
  FolderOpen,
  MessageSquare,
  Search,
  Plus,
  Eye,
  UserMinus,
  Check,
  X,
  AlertCircle,
  Loader2,
  GraduationCap,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { cn, getInitials } from '@/lib/utils'
import { useBatches, useEnrollments, useAttendance, useTeachers, useResources, useSubjects, useTeacherAssignments, useCreateTeacherAssignment, useDeleteTeacherAssignment } from '@/hooks/useAdmin'
import type { TeacherAssignment, User, Subject } from '@/api/admin.api'

export function BatchDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('students')
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState('all')
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false)
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})
  
  // Teacher assignment state
  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  // Fetch real data
  const { data: allBatches, isLoading: batchesLoading } = useBatches({})
  const { data: allEnrollments, isLoading: enrollmentsLoading } = useEnrollments()
  const { data: allAttendance } = useAttendance({ batchId: id })
  const { data: allTeachers } = useTeachers()
  const { data: allResources } = useResources({ batchId: id })
  const { data: allSubjects } = useSubjects()
  const { data: teacherAssignments } = useTeacherAssignments({ batchId: id })

  // Teacher assignment mutations
  const createTeacherAssignmentMutation = useCreateTeacherAssignment()
  const deleteTeacherAssignmentMutation = useDeleteTeacherAssignment()

  // Find the specific batch
  const batch = allBatches?.find(b => b.id === id)
  
  // Filter enrollments for this batch
  const enrollments = allEnrollments?.filter(e => e.batch.id === id) || []
  
  // Get subjects for this batch's course
  const courseSubjects = allSubjects?.filter(s => s.courseId === batch?.courseId) || []
  
  // Get assigned teachers for this batch
  const assignments = teacherAssignments || []
  
  // Get students from enrollments
  const students = enrollments.map(e => ({
    id: e.student.id,
    name: e.student.name,
    email: e.student.email,
    enrolledOn: e.createdAt,
    status: e.status,
  }))

  // Initialize attendance marks when students load
  if (students.length > 0 && Object.keys(attendanceMarks).length === 0) {
    const initial: Record<string, 'PRESENT' | 'ABSENT'> = {}
    students.forEach(s => { initial[s.id] = 'PRESENT' })
    // This will be set once when data loads
  }

  // Filter attendance and resources for this batch
  const attendanceData = allAttendance || []
  const resources = allResources || []
  
  // Calculate stats
  const totalStudents = students.length
  const resourceCount = resources.length

  // Teacher assignment handlers
  const handleAssignTeacher = async () => {
    if (!selectedTeacherId || !selectedSubjectId || !id) return
    await createTeacherAssignmentMutation.mutateAsync({
      teacherId: selectedTeacherId,
      subjectId: selectedSubjectId,
      batchId: id,
    })
    setSelectedTeacherId('')
    setSelectedSubjectId('')
    setAssignTeacherOpen(false)
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this teacher assignment?')) {
      await deleteTeacherAssignmentMutation.mutateAsync(assignmentId)
    }
  }

  // Loading state
  if (batchesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Not found state
  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Batch Not Found</h2>
        <p className="text-muted-foreground">The batch you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/batches">Back to Batches</Link>
        </Button>
      </div>
    )
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase())
    const matchesStatus = studentStatusFilter === 'all' || student.status.toLowerCase() === studentStatusFilter
    return matchesSearch && matchesStatus
  })

  const presentCount = Object.values(attendanceMarks).filter(s => s === 'PRESENT').length

  const handleMarkAllPresent = () => {
    const marks: Record<string, 'PRESENT' | 'ABSENT'> = {}
    students.forEach(s => { marks[s.id] = 'PRESENT' })
    setAttendanceMarks(marks)
  }

  const handleMarkAllAbsent = () => {
    const marks: Record<string, 'PRESENT' | 'ABSENT'> = {}
    students.forEach(s => { marks[s.id] = 'ABSENT' })
    setAttendanceMarks(marks)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        backLink="/batches"
        backLabel="Back to Batches"
        badge={<Badge variant="outline">{batch.course?.name || 'Course'}</Badge>}
        title={batch.name}
        subtitle={`${batch.course?.name || ''} ${batch.description ? `· ${batch.description}` : ''}`}
        rightContent={
          <>
            <Badge>{batch.status}</Badge>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Batch
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="font-mono text-2xl font-semibold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="font-mono text-2xl font-semibold">
                {attendanceData?.length ? Math.round(
                  attendanceData.filter(a => a.status === 'PRESENT').length / attendanceData.length * 100
                ) : 0}%
              </p>
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
              <p className="font-mono text-2xl font-semibold">{resourceCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Messages</p>
              <p className="font-mono text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Teachers */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Class Teachers</p>
            <Dialog open={assignTeacherOpen} onOpenChange={setAssignTeacherOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Teacher to Batch</DialogTitle>
                  <DialogDescription>
                    Assign a teacher to teach a specific subject in this batch.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {allTeachers?.map((teacher: User) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseSubjects.map((subject: Subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignTeacherOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignTeacher}
                    disabled={!selectedTeacherId || !selectedSubjectId || createTeacherAssignmentMutation.isPending}
                  >
                    {createTeacherAssignmentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Assign Teacher
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-3">
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment: TeacherAssignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(assignment.teacher.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{assignment.teacher.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="h-3 w-3" />
                          <span>{assignment.subject.name}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No teachers assigned yet. Click "Assign Teacher" to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Students ({filteredStudents.length})
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 sm:w-64"
                />
              </div>
              <Select value={studentStatusFilter} onValueChange={setStudentStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </div>
          </div>

          {enrollmentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filteredStudents.length > 0 ? (
            <Card className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Link to={`/students/${student.id}`} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium hover:underline">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.enrolledOn).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/students/${student.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Batch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No Students</h3>
                <p className="text-sm text-muted-foreground">No students have been enrolled in this batch yet.</p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Enroll Student
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-6 space-y-6">
          {/* Mark Today's Attendance */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Today — {today}</p>
                  <p className="text-sm text-muted-foreground">Mark attendance for today's class</p>
                </div>
                <Sheet open={markAttendanceOpen} onOpenChange={setMarkAttendanceOpen}>
                  <SheetTrigger asChild>
                    <Button>Mark Attendance</Button>
                  </SheetTrigger>
                  <SheetContent className="flex w-full flex-col sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Mark Attendance — {batch.name}</SheetTitle>
                      <SheetDescription>
                        {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </SheetDescription>
                    </SheetHeader>

                    {students.length > 0 ? (
                      <>
                        <div className="my-4 flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark All Present
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleMarkAllAbsent}>
                            <X className="mr-2 h-4 w-4" />
                            Mark All Absent
                          </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          <div className="space-y-2">
                            {students.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(student.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">{student.name}</span>
                                </div>
                                <div className="flex rounded-full border">
                                  <button
                                    className={cn(
                                      'rounded-l-full px-3 py-1 text-xs font-medium transition-colors',
                                      attendanceMarks[student.id] === 'PRESENT'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                    )}
                                    onClick={() =>
                                      setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'PRESENT' }))
                                    }
                                  >
                                    PRESENT
                                  </button>
                                  <button
                                    className={cn(
                                      'rounded-r-full px-3 py-1 text-xs font-medium transition-colors',
                                      attendanceMarks[student.id] === 'ABSENT'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                    )}
                                    onClick={() =>
                                      setAttendanceMarks((prev) => ({ ...prev, [student.id]: 'ABSENT' }))
                                    }
                                  >
                                    ABSENT
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <SheetFooter className="mt-4 flex-col gap-2 sm:flex-col">
                          <p className="text-sm text-muted-foreground">
                            Present: {presentCount} / {totalStudents}
                          </p>
                          <Button className="w-full" onClick={() => setMarkAttendanceOpen(false)}>
                            Save Attendance
                          </Button>
                        </SheetFooter>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">No students to mark attendance for.</p>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceData && attendanceData.length > 0 ? (
                <div className="space-y-2">
                  {attendanceData.slice(0, 10).map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm">
                        {new Date(record.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <Badge variant={record.status === 'PRESENT' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">No attendance records yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Resources ({resourceCount})</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {resources && resources.length > 0 ? (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.fileType || 'File'}</p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">No Resources</h3>
                  <p className="text-sm text-muted-foreground">No resources have been uploaded yet.</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Resource
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">Chat Coming Soon</h3>
              <p className="text-sm text-muted-foreground">Batch chat functionality is not yet available.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
