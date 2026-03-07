import { AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PendingAction {
  id: string
  title: string
  subtitle: string
  priority: 'high' | 'medium' | 'low'
  href: string
}

interface PendingActionsPanelProps {
  title: string
  actions: PendingAction[]
  className?: string
}

export function PendingActionsPanel({
  title,
  actions,
  className,
}: PendingActionsPanelProps) {
  if (actions.length === 0) {
    return (
      <div className={cn('rounded-xl border p-4', className)}>
        <h3 className="mb-3 text-sm font-medium">{title}</h3>
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="mb-2 rounded-full bg-muted p-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No pending actions</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
          {actions.length} pending
        </span>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50',
              action.priority === 'high' && 'bg-red-500/5'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                action.priority === 'high' && 'bg-red-500/10',
                action.priority === 'medium' && 'bg-amber-500/10',
                action.priority === 'low' && 'bg-muted'
              )}
            >
              <AlertCircle
                className={cn(
                  'h-4 w-4',
                  action.priority === 'high' && 'text-red-500',
                  action.priority === 'medium' && 'text-amber-500',
                  action.priority === 'low' && 'text-muted-foreground'
                )}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.subtitle}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  )
}
