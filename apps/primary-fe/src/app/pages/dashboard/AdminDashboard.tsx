import {
  Users,
  UserCheck,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react'
import { StatCard, QuickAction, AttendanceRing } from './components'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    )
  }

  const todayAttendanceRate = stats?.attendanceToday?.total 
    ? Math.round((stats.attendanceToday.present / stats.attendanceToday.total) * 100)
    : 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's your institute at a glance.
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-5">
        <StatCard
          title="Total Students"
          value={stats?.users?.students?.toLocaleString('en-IN') ?? '0'}
          icon={Users}
        />
        <StatCard
          title="Total Teachers"
          value={stats?.users?.teachers ?? 0}
          icon={UserCheck}
        />
        <StatCard
          title="Active Courses"
          value={stats?.courses ?? 0}
          icon={BookOpen}
        />
        <StatCard
          title="Active Batches"
          value={stats?.batches ?? 0}
          icon={Layers}
        />
        <StatCard
          title="Today's Attendance"
          value={`${todayAttendanceRate}%`}
          icon={CalendarIcon}
          variant="highlight"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* Quick Management Actions */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-sm font-medium text-muted-foreground">Quick Management</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <QuickAction
                title="Manage Courses"
                description="Edit curriculum & modules"
                icon={BookOpen}
                href="/courses"
                variant="primary"
              />
              <QuickAction
                title="Manage Batches"
                description="View & edit batch details"
                icon={Layers}
                href="/batches"
              />
              <QuickAction
                title="Manage Students"
                description="Student profiles & enrollments"
                icon={GraduationCap}
                href="/students"
              />
              <QuickAction
                title="Manage Teachers"
                description="Teacher assignments & profiles"
                icon={UserCheck}
                href="/teachers"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="rounded-xl border p-4 sm:p-6">
            <h3 className="mb-3 sm:mb-4 font-medium">Institute Summary</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="font-mono text-xl sm:text-3xl font-bold">{stats?.enrollments ?? 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Enrollments</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xl sm:text-3xl font-bold">{stats?.subjects ?? 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Subjects</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xl sm:text-3xl font-bold">{stats?.recentActivity?.newEnrollments ?? 0}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">New This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Today's Overview */}
          <div className="rounded-xl border p-4 sm:p-6">
            <h3 className="mb-3 sm:mb-4 font-medium">Today's Overview</h3>
            {stats?.attendanceToday?.total ? (
              <div className="flex items-center justify-around gap-4">
                <AttendanceRing
                  percentage={todayAttendanceRate}
                  size="responsive"
                  label="Attendance"
                />
                <div className="space-y-3 sm:space-y-4 text-center">
                  <div>
                    <p className="font-mono text-xl sm:text-2xl font-bold">{stats.attendanceToday.present}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Present</p>
                  </div>
                  <div>
                    <p className="font-mono text-xl sm:text-2xl font-bold text-red-500">{stats.attendanceToday.absent}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Absent</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-32 items-center justify-center text-muted-foreground">
                <p>No attendance data for today</p>
              </div>
            )}
          </div>

          {/* Recent Activity Summary */}
          <div className="rounded-xl border p-4 sm:p-6">
            <h3 className="mb-3 sm:mb-4 font-medium">Recent Activity</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Resources</span>
                <span className="font-mono font-medium">{stats?.recentActivity?.newResources ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Messages (24h)</span>
                <span className="font-mono font-medium">{stats?.recentActivity?.messagesLast24h ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Admins</span>
                <span className="font-mono font-medium">{stats?.users?.admins ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Parents</span>
                <span className="font-mono font-medium">{stats?.users?.parents ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
