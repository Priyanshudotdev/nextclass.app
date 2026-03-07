import { useRef, useState, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d*$/.test(digit)) return

      const newValue = value.split('')
      newValue[index] = digit.slice(-1)
      const updatedValue = newValue.join('')
      onChange(updatedValue.padEnd(length, ''))

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, onChange, length]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const newValue = value.split('')
        
        if (newValue[index]) {
          newValue[index] = ''
          onChange(newValue.join(''))
        } else if (index > 0) {
          newValue[index - 1] = ''
          onChange(newValue.join(''))
          inputRefs.current[index - 1]?.focus()
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [value, onChange, length]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pastedData) {
        onChange(pastedData.padEnd(length, ''))
        const lastFilledIndex = Math.min(pastedData.length, length) - 1
        inputRefs.current[lastFilledIndex]?.focus()
      }
    },
    [onChange, length]
  )

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={cn(
            'h-12 w-10 rounded-md border bg-background text-center text-lg font-semibold transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            focusedIndex === index
              ? 'border-foreground'
              : value[index]
                ? 'border-foreground/50'
                : 'border-input'
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
