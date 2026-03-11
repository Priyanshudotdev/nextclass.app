import { Link } from 'react-router-dom'
import {
  Megaphone,
  BookOpen,
  FolderOpen,
  TrendingUp,
} from 'lucide-react'
import { StatCard, QuickAction } from './components'

export function StudentDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's your learning progress.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Enrolled Courses"
          value={0}
          icon={BookOpen}
        />
        <StatCard
          title="Attendance"
          value="--"
          icon={TrendingUp}
        />
        <StatCard
          title="Resources"
          value={0}
          icon={FolderOpen}
        />
        <StatCard
          title="Announcements"
          value={0}
          icon={Megaphone}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* My Courses */}
          <div className="rounded-xl border p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">My Courses</h3>
              <Link to="/courses" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No courses enrolled yet</p>
            </div>
          </div>

          {/* Recent Resources */}
          <div className="rounded-xl border p-4 sm:p-6">
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <h3 className="font-medium">Recent Resources</h3>
              <Link to="/resources" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No resources available</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming Classes */}
          <div className="rounded-xl border p-4 sm:p-6">
            <h3 className="mb-3 sm:mb-4 font-medium">Upcoming Classes</h3>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No classes scheduled</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <QuickAction
              title="View Resources"
              description="Access study materials"
              icon={FolderOpen}
              href="/resources"
              variant="primary"
            />
            <QuickAction
              title="My Courses"
              description="Track your progress"
              icon={BookOpen}
              href="/courses"
            />
          </div>

          {/* Announcements */}
          <div className="rounded-xl border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Announcements</h3>
              <Link to="/announcements" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
              <p>No announcements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
