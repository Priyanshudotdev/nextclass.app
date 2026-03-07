import { cn } from '@/lib/utils'

interface AttendanceRingProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
}

export function AttendanceRing({
  percentage,
  size = 'md',
  strokeWidth = 8,
  label,
  sublabel,
  className,
}: AttendanceRingProps) {
  const sizes = {
    sm: 80,
    md: 120,
    lg: 160,
  }

  const dimension = sizes[size]
  const radius = (dimension - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 85) return 'stroke-emerald-500'
    if (percentage >= 70) return 'stroke-amber-500'
    return 'stroke-red-500'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={dimension}
        height={dimension}
        className="-rotate-90 transform"
      >
        {/* Background circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-500', getColor())}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono font-bold',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-2xl',
            size === 'lg' && 'text-3xl'
          )}
        >
          {percentage}%
        </span>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
        {sublabel && (
          <span className="text-[10px] text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
