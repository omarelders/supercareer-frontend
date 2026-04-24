import { useState, Fragment, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User, Briefcase, DollarSign,
  BookOpen, ChevronDown, ArrowRight, ArrowLeft,
} from 'lucide-react'
import Logo from '../../components/Logo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import AnimatedContent from '@/components/reactbits/AnimatedContent'
import GlareHover from '@/components/reactbits/GlareHover'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['job_seeker', 'freelancer', 'employer']),
    skills: z.string().optional(),
    hourly_rate: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid rate e.g. 25.00')
      .optional(),
    specialization: z.string().optional(),
    experience: z.string().optional(),
    bio: z.string().optional(),
    education: z.string().optional(),
    preferences: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// Fields that belong to step 1 – used for per-step validation trigger
const STEP1_FIELDS: (keyof RegisterFormValues)[] = [
  'username', 'full_name', 'email', 'password', 'confirmPassword', 'role',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function inputCls(hasError: boolean) {
  return `w-full pl-11 pr-4 py-3 border rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
    ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}`
}

function plainInputCls() {
  return `w-full px-4 py-3 border border-slate-200 rounded-[var(--radius)] text-sm text-slate-900
    placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
    focus:border-transparent transition`
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Profile' },
  ]
  return (
    <div className="flex items-start mb-8 w-full">
      {steps.map((s, i) => {
        const done = current > s.n
        const active = current === s.n
        return (
          <Fragment key={s.n}>
            {/* Step node: circle + label stacked */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${done
                    ? 'bg-blue-500 text-white'
                    : active
                    ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                    : 'bg-slate-100 text-slate-400'
                  }`}
              >
                {done ? (
                  <svg className="w-4 h-4" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : s.n}
              </div>
              <span
                className={`text-xs font-semibold transition-colors duration-300
                  ${active ? 'text-blue-500' : done ? 'text-slate-500' : 'text-slate-300'}`}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line – sits between the two step nodes, aligned with circle centre (mt = half circle height) */}
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mt-[18px] mx-3 rounded-full transition-all duration-500
                  ${done ? 'bg-blue-500' : 'bg-slate-200'}`}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // After showing the success screen, redirect to /login in 3 s
  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => navigate('/login', { replace: true }), 3000)
    return () => clearTimeout(id)
  }, [success, navigate])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'job_seeker',
      skills: '',
      hourly_rate: '0.00',
      specialization: '',
      experience: '',
      bio: '',
      education: '',
      preferences: '',
    },
  })

  const selectedRole = watch('role')

  // ── Step 1 → Step 2 ─────────────────────────────────────────────────────
  async function goToStep2() {
    const valid = await trigger(STEP1_FIELDS)
    if (valid) setStep(2)
  }

  // ── Final submit ─────────────────────────────────────────────────────────
  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    setIsSubmitting(true)

    const skillsArray = values.skills
      ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['']

    const payload = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
      full_name: values.full_name,
      skills: skillsArray,
      hourly_rate: values.hourly_rate ?? '0.00',
      specialization: values.specialization ?? '',
      experience: values.experience ?? '',
      bio: values.bio ?? '',
      education: values.education ?? '',
      preferences: values.preferences ?? '',
    }

    // ── Step 1: Register ────────────────────────────────────────────────
    try {
      await api.post('/api/register/', payload)
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: Record<string, unknown>; status?: number }
        message?: string
        code?: string
      }

      if (axiosErr.response?.data && typeof axiosErr.response.data === 'object') {
        const data = axiosErr.response.data as Record<string, unknown>
        const messages = Object.entries(data)
          .map(([field, msgs]) => {
            const list = Array.isArray(msgs) ? msgs : [msgs]
            return `${field}: ${list[0]}`
          })
          .join(' • ')
        setServerError(messages)
        const step1Keys = new Set(STEP1_FIELDS as string[])
        if (Object.keys(data).some((k) => step1Keys.has(k))) setStep(1)
      } else if (typeof axiosErr.response?.data === 'string') {
        setServerError(axiosErr.response.data)
      } else if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
        setServerError('Unable to reach the server. Please check your connection and try again.')
      } else {
        setServerError(axiosErr.message ?? 'Registration failed. Please try again.')
      }
      setIsSubmitting(false)
      return // Stop here — registration itself failed
    }

    // ── Registration succeeded — show success screen immediately ────────
    setSuccess(true)
    setIsSubmitting(false)

    // ── Step 2: Auto-login (best-effort) ────────────────────────────────
    // If this fails (e.g. backend cold-start on Render) we still keep the
    // success screen and redirect to /login after 3 s (via useEffect above).
    try {
      await login(values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch {
      // Auto-login failed — the useEffect redirect to /login will handle it
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="w-full max-w-120 mx-auto px-4 md:px-0">
        <AnimatedContent distance={24} duration={0.6} ease="power3.out" className="w-full">
          <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 p-8 md:p-12 flex flex-col items-center text-center gap-5">
            {/* Animated checkmark circle */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 12.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Account created!</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Welcome aboard. Signing you in and redirecting to your dashboard…
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ animation: 'fill-bar 3s linear forwards' }}
              />
            </div>
            <p className="text-xs text-slate-400">Redirecting to login in a moment…</p>
          </div>
        </AnimatedContent>
        <style>{`
          @keyframes fill-bar { from { width: 0% } to { width: 100% } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="w-full max-w-120 mx-auto">
      {/* Header */}
      <AnimatedContent distance={20} duration={0.6} ease="power3.out" className="w-full">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-5" />
          <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>
          <p className="text-base text-slate-500 mt-1.5">
            {step === 1 ? 'Start with your account credentials' : 'Tell us a bit about yourself'}
          </p>
        </div>
      </AnimatedContent>

      <AnimatedContent distance={26} duration={0.6} delay={0.1} ease="power3.out" className="w-full px-4 md:px-0">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 p-6 md:p-10">

          {/* Step indicator */}
          <StepIndicator current={step} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ══════════════════════ STEP 1 ══════════════════════ */}
            <div className={`space-y-5 transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>

              {/* Username */}
              <div>
                <label htmlFor="register-username" className="block text-sm font-bold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-username" type="text" placeholder="johndoe"
                    {...register('username')} className={inputCls(!!errors.username)} />
                </div>
                {errors.username && <p className="text-sm font-medium text-red-500 mt-1.5">{errors.username.message}</p>}
              </div>

              {/* Full name */}
              <div>
                <label htmlFor="register-fullname" className="block text-sm font-bold text-slate-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-fullname" type="text" placeholder="John Doe"
                    {...register('full_name')} className={inputCls(!!errors.full_name)} />
                </div>
                {errors.full_name && <p className="text-sm font-medium text-red-500 mt-1.5">{errors.full_name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-bold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-email" type="email" placeholder="name@company.com"
                    {...register('email')} className={inputCls(!!errors.email)} />
                </div>
                {errors.email && <p className="text-sm font-medium text-red-500 mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-password" type="password" placeholder="••••••••"
                    {...register('password')}
                    className={`${inputCls(!!errors.password)} text-xl tracking-widest`} />
                </div>
                {errors.password && <p className="text-sm font-medium text-red-500 mt-1.5">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="register-confirm-password" className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-confirm-password" type="password" placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={`${inputCls(!!errors.confirmPassword)} text-xl tracking-widest`} />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm font-medium text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="register-role" className="block text-sm font-bold text-slate-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select id="register-role" {...register('role')}
                    className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-[var(--radius)] text-sm text-slate-900
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white">
                    <option value="job_seeker">Job Seeker</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>
              </div>

              {/* Next button */}
              <GlareHover className="w-full border-0 mt-2" width="100%" height="auto"
                background="transparent" borderRadius="12px" glareColor="#ffffff"
                glareOpacity={0.2} glareAngle={90} glareSize={180} transitionDuration={400}>
                <button
                  id="register-next"
                  type="button"
                  onClick={goToStep2}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600
                    text-white font-bold text-base py-3.5 rounded-xl transition-colors"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </GlareHover>

              {/* Social divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-sm font-medium text-slate-400">Or continue with</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 w-full">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-bold text-slate-700">Google</span>
                </button>
                <button type="button"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 w-full">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm font-bold text-slate-700">LinkedIn</span>
                </button>
              </div>
            </div>

            {/* ══════════════════════ STEP 2 ══════════════════════ */}
            <div className={`space-y-5 transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>

              {/* Skills */}
              <div>
                <label htmlFor="register-skills" className="block text-sm font-bold text-slate-700 mb-2">
                  Skills <span className="font-normal text-slate-400">(comma-separated)</span>
                </label>
                <input id="register-skills" type="text" placeholder="React, TypeScript, Python…"
                  {...register('skills')} className={plainInputCls()} />
              </div>

              {/* Specialization */}
              <div>
                <label htmlFor="register-specialization" className="block text-sm font-bold text-slate-700 mb-2">
                  Specialization
                </label>
                <input id="register-specialization" type="text" placeholder="Frontend Development"
                  {...register('specialization')} className={plainInputCls()} />
              </div>

              {/* Hourly Rate – freelancers only */}
              {selectedRole === 'freelancer' && (
                <div>
                  <label htmlFor="register-hourly-rate" className="block text-sm font-bold text-slate-700 mb-2">
                    Hourly rate (USD)
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="register-hourly-rate" type="text" placeholder="0.00"
                      {...register('hourly_rate')} className={inputCls(!!errors.hourly_rate)} />
                  </div>
                  {errors.hourly_rate && (
                    <p className="text-sm font-medium text-red-500 mt-1.5">{errors.hourly_rate.message}</p>
                  )}
                </div>
              )}

              {/* Experience */}
              <div>
                <label htmlFor="register-experience" className="block text-sm font-bold text-slate-700 mb-2">
                  Experience
                </label>
                <input id="register-experience" type="text" placeholder="3 years in software development"
                  {...register('experience')} className={plainInputCls()} />
              </div>

              {/* Education */}
              <div>
                <label htmlFor="register-education" className="block text-sm font-bold text-slate-700 mb-2">
                  Education
                </label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="register-education" type="text" placeholder="BSc Computer Science"
                    {...register('education')}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="register-bio" className="block text-sm font-bold text-slate-700 mb-2">
                  Bio
                </label>
                <textarea id="register-bio" rows={3} placeholder="Tell us a little about yourself…"
                  {...register('bio')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
              </div>

              {/* Preferences */}
              <div>
                <label htmlFor="register-preferences" className="block text-sm font-bold text-slate-700 mb-2">
                  Preferences
                </label>
                <textarea id="register-preferences" rows={2} placeholder="Remote work, full-time, startups…"
                  {...register('preferences')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
              </div>

              {/* Server error */}
              {serverError && (
                <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  {serverError}
                </p>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3.5 border border-slate-200 rounded-xl text-sm font-bold
                    text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <GlareHover className="flex-1 border-0" width="100%" height="auto"
                  background="transparent" borderRadius="12px" glareColor="#ffffff"
                  glareOpacity={0.25} glareAngle={90} glareSize={180} transitionDuration={400}>
                  <button
                    id="register-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60
                      disabled:cursor-not-allowed text-white font-bold text-base py-3.5
                      rounded-xl transition-colors"
                  >
                    {isSubmitting ? 'Creating account…' : 'Create Account'}
                  </button>
                </GlareHover>
              </div>
            </div>

          </form>
        </div>
      </AnimatedContent>

      {/* Footer links */}
      <AnimatedContent distance={16} duration={0.6} delay={0.2} ease="power3.out" className="w-full">
        <div className="mt-8 text-center space-y-6">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">
              Sign in
            </Link>
          </p>
          <div className="flex justify-center gap-6 text-xs text-slate-400 font-medium">
            <Link to="/" className="hover:text-slate-500 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-500 transition-colors">Terms of Service</Link>
            <span>© 2026 Super career</span>
          </div>
        </div>
      </AnimatedContent>
    </div>
  )
}
