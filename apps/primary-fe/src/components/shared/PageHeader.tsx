import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  backLink?: string
  backLabel?: string
  badge?: React.ReactNode
  title?: string
  subtitle?: string
  rightContent?: React.ReactNode
  className?: string
}

export function PageHeader({
  backLink,
  backLabel,
  badge,
  title,
  subtitle,
  rightContent,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {backLink && (
        <Link
          to={backLink}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel || 'Back'}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {(badge || title || subtitle) && (
          <div className="space-y-1">
            {badge && <div className="mb-1">{badge}</div>}
            {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
        {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
      </div>
    </div>
  )
}
