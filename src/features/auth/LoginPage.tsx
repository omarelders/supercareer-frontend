import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Logo from '../../components/Logo'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAppDispatch } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'
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
  const dispatch = useAppDispatch()

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

  function onSubmit() {
    dispatch(login())
    navigate('/dashboard')
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

      <AnimatedContent distance={26} duration={0.6} delay={0.1} ease="power3.out" className="w-full">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 p-10">
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
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-base py-3.5 rounded-xl mt-2"
              >
                Login
              </button>
            </GlareHover>

            <div className="flex items-center gap-4 py-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-sm font-medium text-slate-400">Or continue with</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 w-full"
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
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 w-full"
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
