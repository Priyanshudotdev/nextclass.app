import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = 'form' | 'success'

export function ForgotPasswordPage() {
  const [state, setState] = useState<State>('form')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setIsLoading(true)
    try {
      // Simulate password reset API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setState('success')
    } catch {
      setError('Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-[40%] flex-col justify-between bg-foreground p-8 text-background lg:flex">
        <div>
          <h1 className="font-display text-2xl font-semibold">NextClass</h1>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Reset your
            <br />
            password
          </h2>
          <p className="text-background/70">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="h-px w-full bg-background/10" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Link to="/">
              <h1 className="font-display text-2xl font-semibold">NextClass</h1>
            </Link>
          </div>

          {state === 'form' ? (
            <>
              {/* Header */}
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">Forgot Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10">
                  <CheckCircle2 className="h-8 w-8 text-foreground" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-semibold">Check your email</h2>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to
                  </p>
                  <p className="font-medium">{email}</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div className="text-left text-sm">
                      <p className="font-medium">Didn't receive the email?</p>
                      <p className="text-muted-foreground">
                        Check your spam folder or{' '}
                        <button
                          onClick={() => setState('form')}
                          className="text-foreground underline hover:no-underline"
                        >
                          try another email address
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link to="/login">Return to Sign In</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
