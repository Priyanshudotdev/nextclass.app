import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

export interface MobileCardAction {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'default' | 'destructive'
}

export interface MobileDataCardProps {
  /** Avatar initials or fallback */
  initials?: string
  /** Avatar image URL */
  avatarUrl?: string
  /** Primary title/name */
  title: string
  /** Subtitle/secondary info (e.g., email) */
  subtitle?: string
  /** Link destination when card is tapped */
  href?: string
  /** Status badge */
  status?: {
    label: string
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  }
  /** Additional info items to display */
  metadata?: Array<{
    label: string
    value: string
    icon?: ReactNode
  }>
  /** Actions in dropdown menu */
  actions?: MobileCardAction[]
  /** Whether to show the dropdown actions */
  showActions?: boolean
  /** Additional className */
  className?: string
}

export function MobileDataCard({
  initials,
  avatarUrl,
  title,
  subtitle,
  href,
  status,
  metadata,
  actions,
  showActions = true,
  className,
}: MobileDataCardProps) {
  const cardContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors',
        href && 'active:bg-muted/50',
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-11 w-11 shrink-0">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={title} />}
        <AvatarFallback className="text-sm font-medium">
          {initials || title.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-sm">{title}</h3>
          {status && (
            <Badge
              variant={status.variant || 'default'}
              className="shrink-0 text-[10px] px-1.5 py-0"
            >
              {status.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        )}
        {metadata && metadata.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {metadata.map((item, index) => (
              <span
                key={index}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                {item.icon && (
                  <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && actions && actions.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action, index) =>
              action.href ? (
                <DropdownMenuItem key={index} asChild>
                  <Link to={action.href} className="flex items-center">
                    {action.icon && (
                      <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                        {action.icon}
                      </span>
                    )}
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                  )}
                >
                  {action.icon && (
                    <span className="mr-2 [&>svg]:h-4 [&>svg]:w-4">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : href ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : null}
    </div>
  )

  if (href) {
    return <Link to={href}>{cardContent}</Link>
  }

  return cardContent
}

// Skeleton for loading state
export function MobileDataCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-card p-3',
        className
      )}
    >
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-8 w-8 shrink-0 animate-pulse rounded bg-muted" />
    </div>
  )
}

// List container for mobile cards
export function MobileDataCardList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}
