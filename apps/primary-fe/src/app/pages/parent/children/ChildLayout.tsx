import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

// Mock data - would come from API
const mockChildren: Record<string, { id: string; name: string; batch: string; rollNo: string; grade: string }> = {
  c1: { id: 'c1', name: 'Ankit Sharma', batch: 'NEET Batch A', rollNo: '24', grade: 'Class 12' },
  c2: { id: 'c2', name: 'Priya Sharma', batch: 'Foundation Batch C', rollNo: '18', grade: 'Class 10' },
}

const tabs = [
  { label: 'Profile', path: '' },
  { label: 'Attendance', path: '/attendance' },
  { label: 'Resources', path: '/resources' },
  { label: 'Schedule', path: '/schedule' },
]

export function ChildLayout() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const child = mockChildren[id || 'c1'] || mockChildren.c1

  const basePath = `/children/${id}`
  const currentPath = location.pathname.replace(basePath, '') || ''

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        to="/children"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Children
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-xl">{getInitials(child.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold font-display">{child.name}</h1>
            <Badge variant="secondary">{child.grade}</Badge>
          </div>
          <p className="text-muted-foreground">
            {child.batch} • Roll No. {child.rollNo}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex gap-4">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path
            return (
              <Link
                key={tab.path}
                to={`${basePath}${tab.path}`}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-primary'
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <Outlet context={{ child }} />
    </div>
  )
}
