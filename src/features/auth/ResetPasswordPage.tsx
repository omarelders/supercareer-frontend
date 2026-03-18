import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowRight, RotateCcw, KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword']
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

// Compute strength label + colour + width from a password string
function getStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw || pw.length === 0) return { label: '', color: 'bg-transparent', width: '0%' }
  if (pw.length < 6) return { label: 'WEAK', color: 'bg-red-500', width: '25%' }
  if (pw.length < 10) return { label: 'FAIR', color: 'bg-yellow-500', width: '50%' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw)
  if (hasUpper && hasSymbol) return { label: 'STRONG', color: 'bg-emerald-500', width: '90%' }
  return { label: 'GOOD', color: 'bg-blue-500', width: '75%' }
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = watch('newPassword')
  const strength = getStrength(newPasswordValue)

  function onSubmit() {
    navigate('/reset-success')
  }

  return (
    <div className="w-full max-w-135 mx-auto">
      <AnimatedContent distance={26} duration={0.6} ease="power3.out" className="w-full">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 px-12 py-10">
          
          {/* Custom refresh/key icon composite */}
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 mb-8 relative">
            <RotateCcw size={20} className="text-blue-500" strokeWidth={2.5} />
            <KeyRound size={12} className="absolute text-blue-500 fill-white" strokeWidth={3} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">Reset Your Password</h1>
          <p className="text-base text-slate-500 mb-8 leading-relaxed max-w-100">
            Almost there! Enter a strong new password for your Super Career account to regain access.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">New Password</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-new-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register('newPassword')}
                  className={`w-full pl-11 pr-4 py-3 border bg-slate-50 rounded-[var(--radius)] text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500 focus:bg-white' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.newPassword && (
                <p className="text-sm font-medium text-red-500 mt-1.5">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">Confirm Password</label>
              <div className="relative">
                <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="Re-type your password"
                  {...register('confirmPassword')}
                  className={`w-full pl-11 pr-4 py-3 border bg-slate-50 rounded-[var(--radius)] text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:bg-white' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Strength meter */}
            <div className="bg-slate-50 rounded-2xl p-5 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Password Strength</span>
                <span
                  className={
                    strength.label === 'STRONG'
                      ? 'text-emerald-500'
                      : strength.label === 'GOOD'
                        ? 'text-blue-500'
                        : strength.label === 'FAIR'
                          ? 'text-yellow-600'
                          : strength.label === 'WEAK' ? 'text-red-500' : 'text-transparent'
                  }
                >
                  {strength.label || 'NONE'}
                </span>
              </div>
              {/* Track */}
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-85">
                Pro tip: Use a mix of uppercase letters, numbers, and symbols for better security.
              </p>
            </div>

            <button
              id="reset-submit"
              type="submit"
              className="w-full bg-blue-600 text-white font-bold text-base py-3.5 rounded-full hover:bg-blue-700 flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              Reset Password <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </form>

          <div className="text-center mt-7">
            <Link to="/login" className="text-sm text-slate-500 font-medium hover:text-slate-700 transition-colors">
              Cancel and return to login
            </Link>
          </div>
        </div>
      </AnimatedContent>
    </div>
  )
}
