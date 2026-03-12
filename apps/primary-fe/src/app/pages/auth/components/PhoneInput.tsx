import { cn } from '@/lib/utils'

export const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
]

interface PhoneInputProps {
  phone: string
  countryCode: string
  onPhoneChange: (val: string) => void
  onCountryChange: (val: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function PhoneInput({
  phone,
  countryCode,
  onPhoneChange,
  onCountryChange,
  disabled,
  placeholder = 'Phone number',
  className,
}: PhoneInputProps) {
  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <select
        value={countryCode}
        onChange={(e) => onCountryChange(e.target.value)}
        disabled={disabled}
        className="shrink-0 border-r border-input bg-muted/30 px-2 py-2 text-sm outline-none transition-colors hover:bg-muted/50 cursor-pointer disabled:cursor-not-allowed"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={phone}
        onChange={(e) => {
          // Only allow digits, spaces, and dashes
          const val = e.target.value.replace(/[^\d\s-]/g, '')
          onPhoneChange(val)
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  )
}
