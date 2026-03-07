import { cn } from '@/lib/utils'

type StrengthLevel = 'weak' | 'fair' | 'strong' | 'very-strong'

interface PasswordStrengthResult {
  strength: StrengthLevel
  score: number
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { strength: 'weak', score: 0 }

  let score = 0

  // Length checks
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z\d]/.test(password)) score += 1

  // Determine level
  if (score <= 2) return { strength: 'weak', score: 1 }
  if (score <= 3) return { strength: 'fair', score: 2 }
  if (score <= 5) return { strength: 'strong', score: 3 }
  return { strength: 'very-strong', score: 4 }
}

export interface PasswordStrengthProps {
  strength: StrengthLevel
  className?: string
}

const strengthConfig: Record<StrengthLevel, { label: string; width: string; colorClass: string }> = {
  weak: {
    label: 'Weak',
    width: '25%',
    colorClass: 'bg-red-500',
  },
  fair: {
    label: 'Fair',
    width: '50%',
    colorClass: 'bg-amber-500',
  },
  strong: {
    label: 'Strong',
    width: '75%',
    colorClass: 'bg-emerald-500',
  },
  'very-strong': {
    label: 'Very Strong',
    width: '100%',
    colorClass: 'bg-emerald-600',
  },
}

export function PasswordStrength({ strength, className }: PasswordStrengthProps) {
  const config = strengthConfig[strength]

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', config.colorClass)}
          style={{ width: config.width }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{config.label}</span>
      </p>
    </div>
  )
}
