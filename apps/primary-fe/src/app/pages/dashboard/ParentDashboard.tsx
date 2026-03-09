import { Link } from 'react-router-dom'
import {
  FolderOpen,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { QuickAction } from './components'

export function ParentDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your child's progress and activities.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Children Info */}
          <div className="rounded-xl border p-6">
            <h3 className="mb-4 font-medium">My Children</h3>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No children linked to your account</p>
            </div>
          </div>

          {/* Enrolled Batches */}
          <div className="rounded-xl border p-6">
            <h3 className="mb-4 font-medium">Enrolled Batches</h3>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No batches enrolled</p>
            </div>
          </div>

          {/* Assigned Teachers */}
          <div className="rounded-xl border p-6">
            <h3 className="mb-4 font-medium">Assigned Teachers</h3>
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <p>No teachers assigned</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <QuickAction
              title="View Attendance"
              description="Check attendance history"
              icon={TrendingUp}
              href="/attendance"
              variant="primary"
            />
            <QuickAction
              title="View Resources"
              description="Study materials shared"
              icon={FolderOpen}
              href="/resources"
            />
            <QuickAction
              title="View Schedule"
              description="Upcoming classes"
              icon={Calendar}
              href="/schedule"
            />
          </div>

          {/* Recent Resources */}
          <div className="rounded-xl border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Recent Resources</h3>
              <Link to="/resources" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
              <p>No resources available</p>
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-xl border p-4">
            <h3 className="mb-4 text-sm font-medium">Announcements</h3>
            <div className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
              <p>No announcements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
