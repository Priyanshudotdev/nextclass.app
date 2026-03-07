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
          !isMobile && (isCollapsed ? 'ml-[60px]' : 'ml-[240px]')
        )}
      >
        <Topbar onMenuClick={toggle} isMobile={isMobile} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
