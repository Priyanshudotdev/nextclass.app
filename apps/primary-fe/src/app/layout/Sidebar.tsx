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
        'fixed left-0 top-0 z-40 h-screen border-r text-[hsl(var(--sidebar-foreground))] transition-all duration-300 ease-in-out',
        'bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-[hsl(var(--sidebar-border))]',
            isCollapsed ? 'justify-center px-3' : 'justify-between px-4'
          )}
        >
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 text-[hsl(var(--sidebar-foreground))]">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/14 shadow-sm ring-1 ring-white/12">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="font-display text-lg text-white">NextClass</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 hover:bg-white/10 hover:text-white',
              isCollapsed && 'rotate-180'
            )}
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

              const linkContent = (
                <Link
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out cursor-pointer',
                    isActive
                      ? 'bg-white/14 text-[hsl(var(--sidebar-active-text))] shadow-sm backdrop-blur-sm'
                      : 'text-[hsl(var(--sidebar-text))] hover:translate-x-1 hover:bg-white/10 hover:text-white',
                    isCollapsed && 'justify-center px-3'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105', isActive ? 'text-white' : 'text-[hsl(var(--sidebar-text))] group-hover:text-white')} />
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
        <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center justify-center rounded-md p-2 text-[hsl(var(--sidebar-text))] transition-all duration-200 ease-out cursor-pointer hover:scale-[1.02] hover:bg-white/10 hover:text-white"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white/14 text-xs font-medium text-white ring-1 ring-white/12">
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
                <AvatarFallback className="bg-white/14 text-sm font-medium text-white ring-1 ring-white/12">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-white/72">{user?.role}</p>
              </div>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => logout()}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:bg-white/10 hover:text-white"
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
      <aside className="fixed left-0 top-0 z-50 h-screen w-72 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-foreground))] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-[hsl(var(--sidebar-foreground))]" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/14 shadow-sm ring-1 ring-white/12">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="font-display text-lg text-white">NextClass</span>
            </Link>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:bg-white/10 hover:text-white"
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
                      'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out cursor-pointer',
                      isActive
                        ? 'bg-white/14 text-[hsl(var(--sidebar-active-text))] shadow-sm backdrop-blur-sm'
                        : 'text-[hsl(var(--sidebar-text))] hover:translate-x-1 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105', isActive ? 'text-white' : 'text-[hsl(var(--sidebar-text))] group-hover:text-white')} />
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
                <AvatarFallback className="bg-white/14 text-sm font-medium text-white ring-1 ring-white/12">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-white/72">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout()
                  onClose()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[hsl(var(--sidebar-text))] transition-all duration-200 ease-out cursor-pointer hover:scale-105 hover:bg-white/10 hover:text-white"
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
