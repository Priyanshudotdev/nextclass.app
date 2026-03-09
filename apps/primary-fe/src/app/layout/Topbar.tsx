import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
  isMobile: boolean
}

export function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const { user, logout, hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(3) // Mock notification count

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const quickActions = [
    { label: 'Add Student', icon: UserPlus, href: '/students/new', roles: ['ADMIN'] },
    { label: 'Add Teacher', icon: UserPlus, href: '/teachers/new', roles: ['ADMIN'] },
    { label: 'Create Course', icon: BookOpen, href: '/courses/new', roles: ['ADMIN'] },
    { label: 'Create Batch', icon: Users, href: '/batches/new', roles: ['ADMIN'] },
  ]

  const filteredActions = quickActions.filter((action) => {
    if (!action.roles) return true
    return action.roles.some((role) => hasRole(role as 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'))
  })

  return (
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

        {/* Search - Hidden on very small screens */}
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
        {hasRole('ADMIN') && filteredActions.length > 0 && (
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
              {filteredActions.map((action) => (
                <DropdownMenuItem key={action.label} className="cursor-pointer">
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Mobile Quick Action */}
        {hasRole('ADMIN') && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden">
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quick Actions</TooltipContent>
          </Tooltip>
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
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center p-0 text-[10px]"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

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
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
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
  )
}
