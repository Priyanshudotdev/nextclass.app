import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSidebarState } from '@/hooks/use-sidebar'
import { Sidebar, MobileSidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const { isOpen, isCollapsed, isMobile, toggle, close } = useSidebarState()

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />}

      {/* Mobile Sidebar */}
      {isMobile && <MobileSidebar isOpen={isOpen} onClose={close} />}

      {/* Main Content */}
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-300 ease-in-out',
          !isMobile && (isCollapsed ? 'ml-16' : 'ml-60')
        )}
      >
        <Topbar onMenuClick={toggle} isMobile={isMobile} />

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
