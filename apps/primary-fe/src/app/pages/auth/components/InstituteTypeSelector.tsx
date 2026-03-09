import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface Option {
  value: string
  label: string
}

interface InstituteTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  options?: Option[]
  className?: string
}

const defaultInstituteTypes: Option[] = [
  { value: 'jee', label: 'IIT/JEE' },
  { value: 'neet', label: 'NEET' },
  { value: 'both', label: 'Both JEE & NEET' },
  { value: 'school', label: 'School Tuition' },
  { value: 'other', label: 'Foundation / Other' },
]

export function InstituteTypeSelector({
  value,
  onChange,
  label,
  options = defaultInstituteTypes,
  className,
}: InstituteTypeSelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {options.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              value === type.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-transparent text-foreground hover:bg-muted'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface StudentCountSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const studentCounts = [
  { value: 'lt50', label: 'Less than 50' },
  { value: '50-200', label: '50–200' },
  { value: '200-500', label: '200–500' },
  { value: '500+', label: '500+' },
]

export function StudentCountSelector({
  value,
  onChange,
  className,
}: StudentCountSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {studentCounts.map((count) => (
        <button
          key={count.value}
          type="button"
          onClick={() => onChange(count.value)}
          className={cn(
            'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            value === count.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-transparent text-foreground hover:bg-muted'
          )}
        >
          {count.label}
        </button>
      ))}
    </div>
  )
}
