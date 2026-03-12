import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Check, Building2, Users, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StepIndicator, PasswordStrength, InstituteTypeSelector, getPasswordStrength, PhoneInput } from './components'
import { cn } from '@/lib/utils'
import { useRegister } from '@/hooks/auth'
import { toast } from 'sonner'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = (v: string) => EMAIL_REGEX.test(v.trim())
const getDigits = (v: string) => v.replace(/\D/g, '')

type Step = 1 | 2 | 3 | 4

interface FormData {
  // Step 1: Institute Info
  instituteName: string
  instituteType: string
  studentCount: string

  // Step 2: Admin Account
  adminName: string
  adminEmail: string
  adminPhone: string
  adminPhoneCountryCode: string
  password: string
  confirmPassword: string

  // Step 3: Institute Details
  instituteAddress: string
  instituteCity: string
  instituteState: string
  institutePincode: string
  academicYear: string

  // Terms
  termsAccepted: boolean
}

const initialFormData: FormData = {
  instituteName: '',
  instituteType: '',
  studentCount: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  adminPhoneCountryCode: '+91',
  password: '',
  confirmPassword: '',
  instituteAddress: '',
  instituteCity: '',
  instituteState: '',
  institutePincode: '',
  academicYear: '',
  termsAccepted: false,
}

const stepLabels = ['Institute Info', 'Admin Account', 'Institute Details', 'Review & Launch']

export function RegisterPage() {
  const registerMutation = useRegister()
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateStep = (currentStep: Step): boolean => {
    setError('')

    switch (currentStep) {
      case 1:
        if (!formData.instituteName.trim()) {
          setError('Institute name is required')
          return false
        }
        if (!formData.instituteType) {
          setError('Please select institute type')
          return false
        }
        if (!formData.studentCount) {
          setError('Please select student count range')
          return false
        }
        return true

      case 2:
        if (!formData.adminName.trim() || formData.adminName.trim().length < 2) {
          setError('Please enter your full name (at least 2 characters)')
          return false
        }
        if (!formData.adminEmail.trim()) {
          setError('Email is required')
          return false
        }
        if (!isValidEmail(formData.adminEmail)) {
          setError('Please enter a valid email address')
          return false
        }
        if (!formData.adminPhone.trim()) {
          setError('Phone number is required')
          return false
        }
        if (getDigits(formData.adminPhone).length < 8) {
          setError('Please enter a valid phone number (at least 8 digits)')
          return false
        }
        if (!formData.password) {
          setError('Password is required')
          return false
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return false
        }
        if (passwordStrength.strength === 'weak') {
          setError('Password is too weak')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        return true

      case 3:
        if (!formData.instituteAddress.trim()) {
          setError('Address is required')
          return false
        }
        if (!formData.instituteCity.trim()) {
          setError('City is required')
          return false
        }
        if (!formData.instituteState.trim()) {
          setError('State is required')
          return false
        }
        return true

      case 4:
        if (!formData.termsAccepted) {
          setError('Please accept the terms and conditions')
          return false
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) return

    if (step < 4) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    registerMutation.mutate(
      {
        instituteName: formData.instituteName,
        instituteType: formData.instituteType,
        studentCount: formData.studentCount,
        instituteAddress: formData.instituteAddress,
        instituteCity: formData.instituteCity,
        instituteState: formData.instituteState,
        institutePincode: formData.institutePincode,
        name: formData.adminName,
        email: formData.adminEmail,
        password: formData.password,
      },
      {
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
            'Registration failed. Please try again.'
          setError(message)
          toast.error(message)
        },
      }
    )
  }

  const isLoading = registerMutation.isPending

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Progress */}
      <div className="hidden w-[40%] flex-col justify-between bg-primary p-8 text-primary-foreground lg:flex">
        <div>
          <h1 className="font-display text-2xl font-semibold">NextClass</h1>
        </div>

        <div className="space-y-8">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Register your
            <br />
            coaching institute
          </h2>

          {/* Step Progress */}
          <div className="space-y-4">
            {stepLabels.map((label, index) => {
              const stepNum = index + 1
              const isCompleted = step > stepNum
              const isCurrent = step === stepNum
              const isPending = step < stepNum

              return (
                <div
                  key={label}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                    isCurrent && 'bg-primary-foreground/10',
                    isCompleted && 'text-primary-foreground/80'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                      isCompleted && 'bg-primary-foreground/20 text-primary-foreground',
                      isCurrent && 'bg-primary-foreground text-primary',
                      isPending && 'bg-primary-foreground/10 text-primary-foreground/50'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={cn(isPending && 'text-primary-foreground/50')}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-px w-full bg-primary-foreground/10" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Logo & Progress */}
          <div className="lg:hidden">
            <Link to="/" className="mb-6 inline-block">
              <h1 className="font-display text-2xl font-semibold">NextClass</h1>
            </Link>
            <StepIndicator currentStep={step} totalSteps={4} className="mb-4" />
          </div>

          {/* Step 1: Institute Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">Institute Information</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us about your coaching center
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instituteName">Institute Name</Label>
                  <Input
                    id="instituteName"
                    placeholder="e.g., Sharma Classes"
                    value={formData.instituteName}
                    onChange={(e) => updateFormData({ instituteName: e.target.value })}
                  />
                </div>

                <InstituteTypeSelector
                  label="Institute Type"
                  options={[
                    { value: 'jee', label: 'IIT/JEE' },
                    { value: 'neet', label: 'NEET' },
                    { value: 'both', label: 'Both' },
                    { value: 'foundation', label: 'Foundation' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={formData.instituteType}
                  onChange={(value) => updateFormData({ instituteType: value })}
                />

                <InstituteTypeSelector
                  label="Number of Students"
                  options={[
                    { value: 'lt50', label: '<50' },
                    { value: '50-200', label: '50-200' },
                    { value: '200-500', label: '200-500' },
                    { value: '500-1000', label: '500-1000' },
                    { value: '1000+', label: '1000+' },
                  ]}
                  value={formData.studentCount}
                  onChange={(value) => updateFormData({ studentCount: value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">Admin Account</h2>
                <p className="text-sm text-muted-foreground">
                  Create your administrator account
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Your Name</Label>
                  <Input
                    id="adminName"
                    placeholder="Full name"
                    value={formData.adminName}
                    onChange={(e) => updateFormData({ adminName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@institute.com"
                    value={formData.adminEmail}
                    onChange={(e) => updateFormData({ adminEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <PhoneInput
                    phone={formData.adminPhone}
                    countryCode={formData.adminPhoneCountryCode}
                    onPhoneChange={(val) => updateFormData({ adminPhone: val })}
                    onCountryChange={(val) => updateFormData({ adminPhoneCountryCode: val })}
                  />
                </div>
                    <p><span className="text-muted-foreground">Phone:</span> {formData.adminPhoneCountryCode} {formData.adminPhone}</p>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateFormData({ password: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && <PasswordStrength strength={passwordStrength.strength} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Institute Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">Institute Details</h2>
                <p className="text-sm text-muted-foreground">
                  Additional information about your institute
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instituteAddress">Address</Label>
                  <Textarea
                    id="instituteAddress"
                    placeholder="Enter complete address"
                    value={formData.instituteAddress}
                    onChange={(e) => updateFormData({ instituteAddress: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteCity">City</Label>
                  <Input
                    id="instituteCity"
                    placeholder="e.g., Kota, Delhi, Mumbai"
                    value={formData.instituteCity}
                    onChange={(e) => updateFormData({ instituteCity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteState">State</Label>
                  <Input
                    id="instituteState"
                    placeholder="e.g., Rajasthan, Maharashtra"
                    value={formData.instituteState}
                    onChange={(e) => updateFormData({ instituteState: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutePincode">Pincode</Label>
                  <Input
                    id="institutePincode"
                    placeholder="e.g., 324005"
                    value={formData.institutePincode}
                    onChange={(e) => updateFormData({ institutePincode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    placeholder="e.g., 2025-26"
                    value={formData.academicYear}
                    onChange={(e) => updateFormData({ academicYear: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">Review & Launch</h2>
                <p className="text-sm text-muted-foreground">
                  Verify your information before creating your institute
                </p>
              </div>

              <div className="space-y-4">
                {/* Institute Info Review */}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Institute</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {formData.instituteName}</p>
                    <p><span className="text-muted-foreground">Type:</span> {formData.instituteType}</p>
                    <p><span className="text-muted-foreground">Size:</span> {formData.studentCount} students</p>
                  </div>
                </div>

                {/* Admin Info Review */}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Administrator</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {formData.adminName}</p>
                    <p><span className="text-muted-foreground">Email:</span> {formData.adminEmail}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {formData.adminPhone}</p>
                  </div>
                </div>

                {/* Location Review */}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Location & Year</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">City:</span> {formData.instituteCity}</p>
                    <p><span className="text-muted-foreground">State:</span> {formData.instituteState}</p>
                    {formData.institutePincode && <p><span className="text-muted-foreground">Pincode:</span> {formData.institutePincode}</p>}
                    <p><span className="text-muted-foreground">Academic Year:</span> {formData.academicYear || 'Not specified'}</p>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-input"
                  />
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Terms & Conditions</span>
                    </div>
                    <p className="text-muted-foreground">
                      I agree to the{' '}
                      <a href="#" className="underline hover:text-primary">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="underline hover:text-primary">Privacy Policy</a>
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            {step < 4 ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Institute...
                  </>
                ) : (
                  'Launch Your Institute →'
                )}
              </Button>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
