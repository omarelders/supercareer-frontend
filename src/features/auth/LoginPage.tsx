import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Logo from '../../components/Logo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/context/AuthContext'
import AnimatedContent from '@/components/reactbits/AnimatedContent'
import GlareHover from '@/components/reactbits/GlareHover'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Navigate AFTER React commits isAuthenticated = true ──
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      // Navigation happens via AuthContext state triggers + ProtectedRoute
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      const detail = axiosErr?.response?.data?.detail
      const genericMsg = err instanceof Error ? err.message : 'Invalid email or password. Please try again.'
      setServerError(detail ?? genericMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-120 mx-auto">
      <AnimatedContent distance={20} duration={0.6} ease="power3.out" className="w-full">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-5" />
          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-base text-slate-500 mt-1.5">Please enter your details to sign in</p>
        </div>
      </AnimatedContent>

      <AnimatedContent distance={26} duration={0.6} delay={0.1} ease="power3.out" className="w-full px-4 md:px-0">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-[var(--radius)] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-red-500 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-[var(--radius)] text-xl tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-red-500 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer max-w-fit group">
                <div className="relative flex items-center justify-center">
                  <input
                    id="login-remember"
                    type="checkbox"
                    {...register('remember')}
                    className="peer w-5 h-5 appearance-none rounded-full border border-slate-300 checked:bg-blue-500 checked:border-blue-500 cursor-pointer transition-colors"
                  />
                  <svg className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors">Remember me for 30 days</span>
              </label>
            </div>

            {serverError && (
              <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {serverError}
              </p>
            )}

            <GlareHover
              className="w-full border-0"
              width="100%"
              height="auto"
              background="transparent"
              borderRadius="12px"
              glareColor="#ffffff"
              glareOpacity={0.2}
              glareAngle={90}
              glareSize={180}
              transitionDuration={400}
            >
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl mt-2 transition-colors"
              >
                {isSubmitting ? 'Signing in…' : 'Login'}
              </button>
            </GlareHover>


          </form>
        </div>
      </AnimatedContent>

      <AnimatedContent distance={16} duration={0.6} delay={0.2} ease="power3.out" className="w-full">
        <div className="mt-8 text-center space-y-6">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 font-bold hover:text-blue-600 transition-colors">
              Start your free trial
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
