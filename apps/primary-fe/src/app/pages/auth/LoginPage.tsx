import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput, PhoneInput } from './components'
import { cn } from '@/lib/utils'
import { useLogin } from '@/hooks/auth'
import { toast } from 'sonner'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = (v: string) => EMAIL_REGEX.test(v.trim())
const getDigits = (v: string) => v.replace(/\D/g, '')

type LoginMode = 'password' | 'otp-request' | 'otp-verify'

export function LoginPage() {
  const loginMutation = useLogin()
  const [mode, setMode] = useState<LoginMode>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [isOtpLoading, setIsOtpLoading] = useState(false)

  // Password login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instituteId, setInstituteId] = useState('')
  const [error, setError] = useState('')

  // OTP login state
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [otp, setOtp] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!instituteId.trim()) {
      setError('Institute ID is required')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    loginMutation.mutate(
      { email, password, instituteId },
      {
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Invalid email or password'
          setError(message)
          toast.error(message)
        },
      }
    )
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (getDigits(phone).length < 8) {
      setError('Enter a valid phone number (at least 8 digits)')
      return
    }

    setIsOtpLoading(true)

    try {
      // TODO: Implement OTP send API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const digits = getDigits(phone)
      const masked = digits.replace(/(\d{2})\d+(\d{2})$/, '$1XXXXXX$2')
      setMaskedPhone(`${countryCode} ${masked}`)
      setMode('otp-verify')
      setResendTimer(30)

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setError('Failed to send OTP')
    } finally {
      setIsOtpLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsOtpLoading(true)

    try {
      // TODO: Implement OTP verify API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (otp.replace(/\s/g, '').length === 6) {
        loginMutation.mutate(
          { email: phone, password: '', instituteId: '' },
          {
            onError: () => {
              setError('Invalid OTP')
              toast.error('Invalid OTP')
            },
          }
        )
      } else {
        setError('Invalid OTP')
      }
    } catch {
      setError('Invalid OTP')
    } finally {
      setIsOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setIsOtpLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResendTimer(30)
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } finally {
      setIsOtpLoading(false)
    }
  }

  const isLoading = loginMutation.isPending || isOtpLoading

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-[40%] flex-col justify-between bg-primary p-8 text-primary-foreground lg:flex">
        <div>
          <h1 className="font-display text-2xl font-semibold">NextClass</h1>
        </div>

        <div className="space-y-8">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Your institute,
            <br />
            fully in control.
          </h2>

          <ul className="space-y-3 text-primary-foreground/80">
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary-foreground/60" />
              <span>Trusted by 200+ coaching centers</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary-foreground/60" />
              <span>Attendance, resources, chat — all in one place</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-primary-foreground/60" />
              <span>Built for IIT/JEE & NEET institutes</span>
            </li>
          </ul>
        </div>

        <div className="h-px w-full bg-primary-foreground/10" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <h1 className="font-display text-2xl font-semibold">NextClass</h1>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          {/* Password Login Form */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instituteId">Institute ID</Label>
                <Input
                  id="instituteId"
                  type="text"
                  placeholder="Your institute code"
                  value={instituteId}
                  onChange={(e) => setInstituteId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode('otp-request')}
              >
                Continue with OTP
              </Button>
            </form>
          )}

          {/* OTP Request Form */}
          {mode === 'otp-request' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <PhoneInput
                  phone={phone}
                  countryCode={countryCode}
                  onPhoneChange={setPhone}
                  onCountryChange={setCountryCode}
                  disabled={isLoading}
                  placeholder="98765 43210"
                />
              </div>

              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode('password')}
              >
                Back to password login
              </Button>
            </form>
          )}

          {/* OTP Verify Form */}
          {mode === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  OTP sent to <span className="font-medium text-foreground">{maskedPhone}</span>
                </p>

                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={cn(
                    'text-sm',
                    resendTimer > 0
                      ? 'text-muted-foreground'
                      : 'text-primary hover:underline'
                  )}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('otp-request')
                  setOtp('')
                }}
              >
                Change phone number
              </Button>
            </form>
          )}

          {/* Registration Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Registering a new institute? </span>
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create your institute →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
