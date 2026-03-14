import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Search,
  Bell,
  HelpCircle,
  Plus,
  UserPlus,
  BookOpen,
  Users,
  Menu,
  Settings,
  LogOut,
  User,
  Layers,
  Loader2,
} from 'lucide-react'
import { useCreateUser, useCreateCourse, useCreateBatch, useCourses } from '@/hooks/useAdmin'
import { toast } from 'sonner'

interface TopbarProps {
  onMenuClick: () => void
  isMobile: boolean
}

type DialogType = 'student' | 'teacher' | 'course' | 'batch' | null

export function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const { user, logout, hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [openDialog, setOpenDialog] = useState<DialogType>(null)

  const { data: notificationsData } = useNotifications(user?.role)
  const markNotificationReadMutation = useMarkNotificationRead(user?.role)
  const markAllNotificationsReadMutation = useMarkAllNotificationsRead(user?.role)

  // Mutation hooks
  const createUserMutation = useCreateUser()
  const createCourseMutation = useCreateCourse()
  const createBatchMutation = useCreateBatch()

  // Courses for batch dropdown
  const { data: coursesData } = useCourses()
  const courses = coursesData || []

  // Form states
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '' })
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' })
  const [courseForm, setCourseForm] = useState({ name: '', description: '', startDate: '' })
  const [batchForm, setBatchForm] = useState({ name: '', courseId: '', startDate: '' })

  const resetForms = () => {
    setStudentForm({ name: '', email: '', password: '' })
    setTeacherForm({ name: '', email: '', password: '' })
    setCourseForm({ name: '', description: '', startDate: '' })
    setBatchForm({ name: '', courseId: '', startDate: '' })
  }

  const closeDialog = () => {
    setOpenDialog(null)
    resetForms()
  }

  const handleCreateStudent = async () => {
    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      toast.error('Name, email and password are required')
      return
    }
    try {
      await createUserMutation.mutateAsync({ ...studentForm, role: 'STUDENT' })
      toast.success('Student created successfully')
      closeDialog()
    } catch {
      toast.error('Failed to create student')
    }
  }

  const handleCreateTeacher = async () => {
    if (!teacherForm.name || !teacherForm.email || !teacherForm.password) {
      toast.error('Name, email and password are required')
      return
    }
    try {
      await createUserMutation.mutateAsync({ ...teacherForm, role: 'TEACHER' })
      toast.success('Teacher created successfully')
      closeDialog()
    } catch {
      toast.error('Failed to create teacher')
    }
  }

  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.startDate) {
      toast.error('Course name and start date are required')
      return
    }
    try {
      await createCourseMutation.mutateAsync(courseForm)
      toast.success('Course created successfully')
      closeDialog()
    } catch {
      toast.error('Failed to create course')
    }
  }

  const handleCreateBatch = async () => {
    if (!batchForm.name || !batchForm.courseId || !batchForm.startDate) {
      toast.error('Batch name, course and start date are required')
      return
    }
    try {
      await createBatchMutation.mutateAsync(batchForm)
      toast.success('Batch created successfully')
      closeDialog()
    } catch {
      toast.error('Failed to create batch')
    }
  }

  const isAnyLoading =
    createUserMutation.isPending ||
    createCourseMutation.isPending ||
    createBatchMutation.isPending

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const notifications = notificationsData || []
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length

  const getNotificationRoute = (type: string) => {
    if (type === 'RESOURCE') return '/resources'
    if (type === 'ATTENDANCE') return '/attendance'
    if (type === 'ANNOUNCEMENT') return '/announcements'
    if (type === 'MESSAGE') return '/chat'
    return '/dashboard'
  }

  const markNotificationsAsRead = () => {
    if (unreadNotificationCount === 0) return
    markAllNotificationsReadMutation.mutate()
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-[hsl(var(--background))] px-4 md:px-6',
          'border-[hsl(var(--border))]'
        )}
      >
        {/* Left: Menu button (mobile) or Search */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors cursor-pointer hover:bg-[hsl(var(--muted))] hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-9 md:w-96 lg:w-120"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Actions - Admin only */}
          {hasRole('ADMIN') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden md:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('student')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('teacher')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Teacher
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('course')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Course
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('batch')}>
                  <Layers className="mr-2 h-4 w-4" />
                  Create Batch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Quick Action */}
          {hasRole('ADMIN') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden">
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('student')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('teacher')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Teacher
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('course')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Course
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setOpenDialog('batch')}>
                  <Layers className="mr-2 h-4 w-4" />
                  Create Batch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Help */}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="hidden sm:flex">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Help & Support</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative" onClick={markNotificationsAsRead}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadNotificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                  >
                    {unreadNotificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-xs text-muted-foreground">{unreadNotificationCount} unread</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 && (
                <DropdownMenuItem disabled>
                  <span className="text-sm text-muted-foreground">No notifications yet</span>
                </DropdownMenuItem>
              )}
              {notifications.map((notification) => (
                <DropdownMenuItem asChild key={notification.id} className="cursor-pointer">
                  <Link
                    to={getNotificationRoute(notification.type)}
                    className="flex flex-col items-start gap-0.5"
                    onClick={() => {
                      if (!notification.isRead) {
                        markNotificationReadMutation.mutate(notification.id)
                      }
                    }}
                  >
                    <span className="text-sm">{notification.title}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    {!notification.isRead && <span className="text-xs text-primary">New</span>}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[hsl(var(--muted))] text-sm font-medium">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/settings">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Add Student Dialog ── */}
      <Dialog open={openDialog === 'student'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" value={studentForm.name} onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="student@email.com" value={studentForm.email} onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="Temporary password" value={studentForm.password} onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleCreateStudent} disabled={isAnyLoading}>
              {isAnyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Teacher Dialog ── */}
      <Dialog open={openDialog === 'teacher'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="Full name" value={teacherForm.name} onChange={(e) => setTeacherForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="teacher@email.com" value={teacherForm.email} onChange={(e) => setTeacherForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="Temporary password" value={teacherForm.password} onChange={(e) => setTeacherForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleCreateTeacher} disabled={isAnyLoading}>
              {isAnyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Course Dialog ── */}
      <Dialog open={openDialog === 'course'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Course Name</Label>
              <Input placeholder="e.g., IIT JEE 2026" value={courseForm.name} onChange={(e) => setCourseForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="Brief description" value={courseForm.description} onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={courseForm.startDate} onChange={(e) => setCourseForm((p) => ({ ...p, startDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={isAnyLoading}>
              {isAnyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Batch Dialog ── */}
      <Dialog open={openDialog === 'batch'} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Batch Name</Label>
              <Input placeholder="e.g., Batch A – Morning" value={batchForm.name} onChange={(e) => setBatchForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                value={batchForm.courseId}
                onChange={(e) => setBatchForm((p) => ({ ...p, courseId: e.target.value }))}
              >
                <option value="">Select a course</option>
                {courses.map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={batchForm.startDate} onChange={(e) => setBatchForm((p) => ({ ...p, startDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleCreateBatch} disabled={isAnyLoading}>
              {isAnyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

