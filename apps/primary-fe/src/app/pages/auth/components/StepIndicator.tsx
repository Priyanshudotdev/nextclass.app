import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function StepIndicator({ currentStep, totalSteps, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep

        return (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                isCompleted && 'border-primary bg-primary text-primary-foreground',
                isCurrent && 'border-primary bg-primary text-primary-foreground',
                isUpcoming && 'border-muted-foreground/30 bg-transparent text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8 transition-colors',
                  stepNumber < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
