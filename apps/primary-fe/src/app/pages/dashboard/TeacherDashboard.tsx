import { Link } from 'react-router-dom'
import {
  Users,
  CalendarCheck,
  FolderOpen,
  Upload,
  Megaphone,
} from 'lucide-react'
import { StatCard, QuickAction } from './components'

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here's your teaching overview.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned Batches"
          value={0}
          icon={Users}
        />
        <StatCard
          title="Total Students"
          value={0}
          icon={Users}
        />
        <StatCard
          title="Pending Attendance"
          value={0}
          icon={CalendarCheck}
        />
        <StatCard
          title="Resources Uploaded"
          value={0}
          icon={FolderOpen}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Schedule */}
          <div className="rounded-xl border p-5">
            <div className="mb-4">
              <h3 className="font-medium">Today's Schedule</h3>
              <p className="text-xs text-muted-foreground">Your classes for today</p>
            </div>
            <div className="py-8 text-center text-muted-foreground">
              <p>No classes scheduled for today</p>
            </div>
          </div>

          {/* My Batches */}
          <div className="rounded-xl border p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">My Batches</h3>
              <Link to="/batches" className="text-xs text-muted-foreground hover:underline">
                View All
              </Link>
            </div>
            <div className="py-8 text-center text-muted-foreground">
              <p>No batches assigned yet</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <QuickAction
              title="Mark Attendance"
              description="Mark today's attendance"
              icon={CalendarCheck}
              href="/attendance"
            />
            <QuickAction
              title="Upload Resource"
              description="Share study materials"
              icon={Upload}
              href="/resources"
            />
            <QuickAction
              title="Post Announcement"
              description="Notify your students"
              icon={Megaphone}
              href="/announcements"
            />
          </div>

          {/* Recent Messages */}
          <div className="rounded-xl border p-4">
            <h3 className="mb-3 text-sm font-medium">Recent Messages</h3>
            <div className="py-4 text-center text-sm text-muted-foreground">
              <p>No recent messages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
