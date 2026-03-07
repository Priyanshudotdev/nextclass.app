import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  CalendarCheck,
  FolderOpen,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Courses', href: '/courses', icon: BookOpen, roles: ['ADMIN'] },
  { title: 'Batches', href: '/batches', icon: Users, roles: ['ADMIN', 'TEACHER'] },
  { title: 'Students', href: '/students', icon: GraduationCap, roles: ['ADMIN'] },
  { title: 'Teachers', href: '/teachers', icon: UserCheck, roles: ['ADMIN'] },
  { title: 'Attendance', href: '/attendance', icon: CalendarCheck, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { title: 'Resources', href: '/resources', icon: FolderOpen },
  { title: 'Chat', href: '/chat', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { title: 'Reports', href: '/reports', icon: BarChart2, roles: ['ADMIN'] },
  { title: 'Settings', href: '/settings', icon: Settings },
]

// Parent-specific navigation
const parentNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Children', href: '/children', icon: Users },
  { title: 'Resources', href: '/resources', icon: FolderOpen },
  { title: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()

  const items = hasRole('PARENT') ? parentNavItems : navItems

  const filteredItems = items.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((role) => hasRole(role))
  })

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r transition-all duration-300 ease-in-out',
        'bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]',
        isCollapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-[hsl(var(--sidebar-border))]',
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          )}
        >
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--foreground))]">
                <span className="text-sm font-bold text-[hsl(var(--background))]">N</span>
              </div>
              <span className="font-display text-lg">NextClass</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              'hover:bg-[hsl(var(--sidebar-hover-bg))] text-[hsl(var(--sidebar-text))]',
              isCollapsed && 'rotate-180'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              const Icon = item.icon

              const linkContent = (
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-text))]'
                      : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover-bg))] hover:text-[hsl(var(--sidebar-active-text))]',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-[hsl(var(--sidebar-active-text))]')} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.title}
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.href}>{linkContent}</div>
            })}
          </nav>
        </ScrollArea>

        {/* User Profile */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center justify-center rounded-md p-2 transition-colors hover:bg-[hsl(var(--sidebar-hover-bg))]"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[hsl(var(--muted))] text-xs font-medium">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.role}</div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[hsl(var(--muted))] text-sm font-medium">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-[hsl(var(--sidebar-active-text))]">{user?.name}</p>
                <p className="truncate text-xs text-[hsl(var(--sidebar-text))]">{user?.role}</p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => logout()}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-colors hover:bg-[hsl(var(--sidebar-hover-bg))] hover:text-[hsl(var(--destructive))]"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// Mobile Sidebar with Sheet
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()

  const items = hasRole('PARENT') ? parentNavItems : navItems

  const filteredItems = items.filter((item) => {
    if (!item.roles) return true
    return item.roles.some((role) => hasRole(role))
  })

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[280px] bg-[hsl(var(--sidebar-bg))] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--foreground))]">
                <span className="text-sm font-bold text-[hsl(var(--background))]">N</span>
              </div>
              <span className="font-display text-lg">NextClass</span>
            </Link>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-colors hover:bg-[hsl(var(--sidebar-hover-bg))]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-active-text))]'
                        : 'text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover-bg))] hover:text-[hsl(var(--sidebar-active-text))]'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[hsl(var(--muted))] text-sm font-medium">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--sidebar-hover-bg))] hover:text-[hsl(var(--destructive))]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
