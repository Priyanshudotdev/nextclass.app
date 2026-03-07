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
        'group flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-foreground/20 hover:bg-muted/50',
        variant === 'primary' && 'border-foreground/10 bg-foreground text-background hover:bg-foreground/90',
        variant === 'warning' && 'border-amber-500/20 bg-amber-500/10',
        variant === 'muted' && 'bg-muted/30',
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          variant === 'default' && 'bg-muted',
          variant === 'primary' && 'bg-background/10',
          variant === 'warning' && 'bg-amber-500/20',
          variant === 'muted' && 'bg-muted'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            variant === 'default' && 'text-muted-foreground',
            variant === 'primary' && 'text-background/80',
            variant === 'warning' && 'text-amber-600',
            variant === 'muted' && 'text-muted-foreground'
          )}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium',
              variant === 'primary' && 'text-background'
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
              'text-xs',
              variant === 'primary' ? 'text-background/60' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </div>

      <ArrowRight
        className={cn(
          'h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100',
          variant === 'primary' ? 'text-background/60' : 'text-muted-foreground'
        )}
      />
    </Link>
  )
}
