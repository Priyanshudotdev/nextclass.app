import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-sidebar'

interface AttendanceRingProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
}

export function AttendanceRing({
  percentage,
  size = 'md',
  strokeWidth,
  label,
  sublabel,
  className,
}: AttendanceRingProps) {
  const isMobile = useIsMobile()
  
  const sizes = {
    sm: 80,
    md: 120,
    lg: 160,
  }

  // For responsive mode, use sm on mobile, md on desktop
  const effectiveSize = size === 'responsive' 
    ? (isMobile ? 'sm' : 'md') 
    : size

  const dimension = sizes[effectiveSize]
  const effectiveStrokeWidth = strokeWidth ?? (isMobile ? 6 : 8)
  const radius = (dimension - effectiveStrokeWidth) / 2
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
          strokeWidth={effectiveStrokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          strokeWidth={effectiveStrokeWidth}
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
            effectiveSize === 'sm' && 'text-lg',
            effectiveSize === 'md' && 'text-2xl',
            effectiveSize === 'lg' && 'text-3xl'
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
