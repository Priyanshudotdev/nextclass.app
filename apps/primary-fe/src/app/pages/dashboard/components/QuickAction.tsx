import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface QuickActionProps {
  title: string
  description?: string
  icon: LucideIcon
  href: string
  count?: number
  variant?: 'default' | 'primary' | 'warning' | 'muted'
  className?: string
}

export function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  count,
  variant = 'default',
  className,
}: QuickActionProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group flex items-center gap-3 sm:gap-4 rounded-xl border p-3 sm:p-4 transition-all hover:border-foreground/20 hover:bg-muted/50 min-h-[56px]',
        variant === 'primary' && 'border-primary/10 bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'warning' && 'border-amber-500/20 bg-amber-500/10',
        variant === 'muted' && 'bg-muted/30',
        className
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg',
          variant === 'default' && 'bg-muted',
          variant === 'primary' && 'bg-primary-foreground/10',
          variant === 'warning' && 'bg-amber-500/20',
          variant === 'muted' && 'bg-muted'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 sm:h-5 sm:w-5',
            variant === 'default' && 'text-muted-foreground',
            variant === 'primary' && 'text-primary-foreground/80',
            variant === 'warning' && 'text-amber-600',
            variant === 'muted' && 'text-muted-foreground'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'text-sm sm:text-base font-medium truncate',
              variant === 'primary' && 'text-primary-foreground'
            )}
          >
            {title}
          </h4>
          {count !== undefined && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                variant === 'warning'
                  ? 'bg-amber-500/20 text-amber-700'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {count}
            </span>
          )}
        </div>
        {description && (
          <p
            className={cn(
              'text-xs truncate hidden sm:block',
              variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </div>

      <ArrowRight
        className={cn(
          'h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100',
          variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}
      />
    </Link>
  )
}
