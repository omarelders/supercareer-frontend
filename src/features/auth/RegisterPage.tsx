import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock,
  FileUp, Loader2, X, CheckCircle2, FileText,
} from 'lucide-react'
import Logo from '../../components/Logo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import AnimatedContent from '@/components/reactbits/AnimatedContent'
import GlareHover from '@/components/reactbits/GlareHover'
import GoogleAuthModal from './GoogleAuthModal'
import { buildCvFromOldResume } from '@/services/cvAiApi'
import { createBaseCv } from '@/services/documentsApi'
import type { CVData } from '@/features/cv-builder/types'
// >>> DEMO_MOCK_DATA_START <<<
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { DEMO_USER } from '@/demo/demoData'
import { saveStoredDemoUser, saveStoredDemoBaseCv } from '@/demo/demoStorage'
// >>> DEMO_MOCK_DATA_END <<<

// ---------------------------------------------------------------------------
// Schema — single step: credentials + CV upload (handled outside the form)
// ---------------------------------------------------------------------------
const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function inputCls(hasError: boolean) {
  return `w-full pl-11 pr-4 py-3 border rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
    ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'}`
}

/** Derive a valid username from the email address (backend only requires email + password). */
function usernameFromEmail(email: string): string {
  const base =
    email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30) || 'user'
  return base.length >= 3 ? base : `${base}_user`
}

/** Prefer the CV's name; fall back to a humanized email prefix. */
function fullNameFromCv(cv: CVData | null, email: string): string {
  const fromCv = cv?.personal.fullName?.trim()
  if (fromCv) return fromCv
  const prefix = email.split('@')[0] || 'New User'
  const humanized = prefix
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return humanized || 'New User'
}

/** Build profile fields from the parsed CV, with safe defaults when no CV was uploaded. */
function profileFieldsFromCv(cv: CVData | null) {
  const skillsArray = cv && cv.skills.length > 0 ? cv.skills : ['']
  const specialization = cv?.personal.title?.trim() || ''

  let experience = ''
  if (cv && cv.experience.length > 0) {
    const first = cv.experience[0]
    const headline = [first.title, first.company].filter(Boolean).join(' at ')
    experience =
      cv.experience.length > 1 && headline
        ? `${headline} (+${cv.experience.length - 1} more role${cv.experience.length - 1 > 1 ? 's' : ''})`
        : headline || `${cv.experience.length} role${cv.experience.length > 1 ? 's' : ''} on CV`
  }

  let education = ''
  if (cv && cv.education.length > 0) {
    const first = cv.education[0]
    education =
      [first.degree, first.school].filter(Boolean).join(' — ') +
      (first.year ? ` (${first.year})` : '')
  }

  const bio = cv?.personal.summary?.trim() || ''

  return { skillsArray, specialization, experience, education, bio }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)

  // ── CV upload state ────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [parsedCv, setParsedCv] = useState<CVData | null>(null)
  const [isParsingCv, setIsParsingCv] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const MAX_CV_SIZE_MB = 5
  const ACCEPTED_CV_TYPES = '.pdf,.doc,.docx,.txt'

  // ── Listen for Google OAuth popup success ──
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        window.location.href = '/dashboard'
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleGoogleSignIn = () => {
    const width = 480
    const height = 580
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)

    const popup = window.open(
      '/auth/google/popup',
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=no,resizable=yes`
    )

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setIsGoogleModalOpen(true)
    } else {
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer)
          if (localStorage.getItem('access')) {
            window.location.href = '/dashboard'
          }
        }
      }, 400)
    }
  }

  // After showing the success screen, redirect to /login in 3 s
  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => navigate('/login', { replace: true }), 3000)
    return () => clearTimeout(id)
  }, [success, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: 'demo@supercareer.ai',
      password: 'password123',
      confirmPassword: 'password123',
    },
  })

  // ── CV upload helpers ──────────────────────────────────────────────────
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') {
          reject(new Error('Failed to read the selected file.'))
          return
        }
        const commaIndex = result.indexOf(',')
        resolve(commaIndex !== -1 ? result.substring(commaIndex + 1) : result)
      }
      reader.onerror = () => reject(new Error('Failed to read the selected file.'))
      reader.readAsDataURL(file)
    })
  }

  async function handleCvFile(file: File | undefined | null) {
    if (!file) return
    setCvError(null)

    if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
      setCvError(`The selected file is too large. Please upload a file smaller than ${MAX_CV_SIZE_MB}MB.`)
      return
    }

    setCvFile(file)
    setParsedCv(null)
    setIsParsingCv(true)
    try {
      const base64 = await fileToBase64(file)
      const built = await buildCvFromOldResume(base64, file.name)
      setParsedCv(built)
    } catch (err) {
      console.error('[RegisterPage] Failed to parse uploaded CV:', err)
      setCvError(
        err instanceof Error
          ? err.message
          : 'We could not read details from this CV. You can try another file or continue — your account will still be created.',
      )
    } finally {
      setIsParsingCv(false)
    }
  }

  function removeCvFile() {
    setCvFile(null)
    setParsedCv(null)
    setCvError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /** Best-effort: persist the parsed CV as the user's Base CV. Never throws. */
  async function persistParsedCvAfterLogin(cv: CVData | null) {
    if (!cv) return
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    if (IS_DEMO_MODE) {
      try {
        saveStoredDemoBaseCv(cv)
      } catch {
        // non-critical
      }
      return
    }
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
    try {
      await createBaseCv(cv)
    } catch {
      // non-critical — profile fields are already stored on the account
    }
  }

  // ── Final submit ─────────────────────────────────────────────────────────
  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    setIsSubmitting(true)

    const { skillsArray, specialization, experience, education, bio } =
      profileFieldsFromCv(parsedCv)

    const payload = {
      username: usernameFromEmail(values.email),
      email: values.email,
      password: values.password,
      role: 'both',
      full_name: fullNameFromCv(parsedCv, values.email),
      skills: skillsArray,
      hourly_rate: '0.00',
      specialization,
      experience,
      bio,
      education,
      preferences: '',
    }

    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    if (IS_DEMO_MODE) {
      localStorage.removeItem('demo_logged_out')
      saveStoredDemoUser({
        ...DEMO_USER,
        email: values.email,
        username: payload.username,
        full_name: payload.full_name,
        role: payload.role,
        skills: skillsArray,
        hourly_rate: payload.hourly_rate,
        specialization,
        experience,
        bio,
        education,
      })
      await persistParsedCvAfterLogin(parsedCv)
      setSuccess(true)
      setIsSubmitting(false)
      try {
        await login(values.email, values.password)
        navigate('/dashboard', { replace: true })
      } catch {
        // fallback
      }
      return
    }
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================

    // ── Register ────────────────────────────────────────────────────────
    try {
      await api.post('/api/register/', payload)
    } catch (err: unknown) {
      // ============================================================================
      // >>> DEMO_MOCK_DATA_START <<<
      console.warn('[RegisterPage] Server offline, falling back to Demo Mode registration')
      localStorage.removeItem('demo_logged_out')
      saveStoredDemoUser({
        ...DEMO_USER,
        email: values.email,
        username: payload.username,
        full_name: payload.full_name,
        role: payload.role,
        skills: skillsArray,
        hourly_rate: payload.hourly_rate,
        specialization,
        experience,
        bio,
        education,
      })
      await persistParsedCvAfterLogin(parsedCv)
      setSuccess(true)
      setIsSubmitting(false)
      try {
        await login(values.email, values.password)
        navigate('/dashboard', { replace: true })
      } catch {
        // fallback
      }
      return
      // >>> DEMO_MOCK_DATA_END <<<
      // ============================================================================

      const axiosErr = err as {
        response?: { data?: unknown; status?: number }
        message?: string
        code?: string
      } | undefined

      const responseData = axiosErr?.response?.data
      if (responseData && typeof responseData === 'object') {
        const data = responseData as Record<string, unknown>
        const messages = Object.entries(data)
          .map(([field, msgs]) => {
            const list = Array.isArray(msgs) ? msgs : [msgs]
            return `${field}: ${list[0]}`
          })
          .join(' • ')
        setServerError(messages)
      } else if (typeof responseData === 'string') {
        setServerError(responseData as string)
      } else if (axiosErr?.code === 'ERR_NETWORK' || !axiosErr?.response) {
        setServerError('Unable to reach the server. Please check your connection and try again.')
      } else {
        setServerError(axiosErr?.message ?? 'Registration failed. Please try again.')
      }
      setIsSubmitting(false)
      return // Stop here — registration itself failed
    }

    // ── Registration succeeded — show success screen immediately ────────
    setSuccess(true)
    setIsSubmitting(false)

    // ── Auto-login (best-effort) ────────────────────────────────────────
    // If this fails (e.g. backend cold-start on Render) we still keep the
    // success screen and redirect to /login after 3 s (via useEffect above).
    try {
      await login(values.email, values.password)
      await persistParsedCvAfterLogin(parsedCv)
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
            Add your login details and upload your CV — we’ll handle the rest
          </p>
        </div>
      </AnimatedContent>

      <AnimatedContent distance={26} duration={0.6} delay={0.1} ease="power3.out" className="w-full px-4 md:px-0">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 p-6 md:p-10">

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

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

            {/* CV upload */}
            <div>
              <span className="block text-sm font-bold text-slate-700 mb-2">
                Your CV
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_CV_TYPES}
                className="hidden"
                onChange={(e) => {
                  void handleCvFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />

              {!cvFile ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    void handleCvFile(e.dataTransfer.files?.[0])
                  }}
                  className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border-2 border-dashed px-6 py-10 text-center cursor-pointer transition
                    ${isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <FileUp size={26} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Drag & drop your CV here, or <span className="text-blue-500">browse files</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                      PDF, DOC, DOCX or TXT • Max {MAX_CV_SIZE_MB}MB • We’ll auto-fill your profile from it
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[var(--radius)] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{cvFile.name}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {(cvFile.size / 1024).toFixed(0)} KB
                        {isParsingCv && ' • Reading your CV…'}
                        {!isParsingCv && parsedCv && ' • Profile details extracted'}
                        {!isParsingCv && !parsedCv && !cvError && ' • Ready'}
                      </p>
                    </div>
                    {isParsingCv ? (
                      <Loader2 size={18} className="animate-spin text-blue-500 shrink-0" />
                    ) : (
                      <button
                        type="button"
                        onClick={removeCvFile}
                        aria-label="Remove CV file"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {isParsingCv && (
                    <div className="mt-3 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}

                  {!isParsingCv && parsedCv && (
                    <div className="mt-3 rounded-xl bg-white border border-slate-200 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <p className="text-xs font-bold">CV parsed — here’s what we found</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Name</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {parsedCv.personal.fullName || '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Title</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">
                            {parsedCv.personal.title || '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Skills</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {parsedCv.skills.length > 0 ? `${parsedCv.skills.length} detected` : '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                          <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Experience</p>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {parsedCv.experience.length > 0
                              ? `${parsedCv.experience.length} role${parsedCv.experience.length > 1 ? 's' : ''}`
                              : '—'}
                          </p>
                        </div>
                      </div>
                      {parsedCv.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {parsedCv.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1"
                            >
                              {skill}
                            </span>
                          ))}
                          {parsedCv.skills.length > 6 && (
                            <span className="text-[11px] font-bold text-slate-400 px-1 py-1">
                              +{parsedCv.skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Upload a different file
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CV error */}
              {cvError && (
                <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mt-3">
                  {cvError}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <GlareHover className="w-full border-0 mt-2" width="100%" height="auto"
              background="transparent" borderRadius="12px" glareColor="#ffffff"
              glareOpacity={0.2} glareAngle={90} glareSize={180} transitionDuration={400}>
              <button
                id="register-submit"
                type="submit"
                disabled={isSubmitting || isParsingCv}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60
                  disabled:cursor-not-allowed text-white font-bold text-base py-3.5
                  rounded-xl transition-colors"
              >
                {isSubmitting ? 'Creating account…' : isParsingCv ? 'Reading your CV…' : 'Create Account'}
              </button>
            </GlareHover>
            <p className="text-xs text-slate-400 font-medium text-center">
              No CV handy? Just hit Create Account — you can add it later from the CV Builder.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-sm font-medium text-slate-400">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Social Sign-in */}
            <div className="grid grid-cols-2 gap-4">
              <button
                id="register-google-btn"
                type="button"
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors w-full cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-bold text-slate-700">Google</span>
              </button>
              <button
                id="register-linkedin-btn"
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors w-full cursor-pointer hover:border-slate-300 shadow-2xs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm font-bold text-slate-700">LinkedIn</span>
              </button>
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

      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  )
}
