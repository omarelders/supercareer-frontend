import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit() {
    navigate('/verify-email')
  }

  return (
    <div className="w-full max-w-135 mx-auto">
      <AnimatedContent distance={24} duration={0.6} ease="power3.out" className="w-full">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 flex items-center justify-center pt-16 pb-12">
            <div className="w-20 h-20 rounded-7 bg-indigo-100 flex items-center justify-center relative">

              <RotateCcw size={40} className="text-blue-500" strokeWidth={2.5} />
              <div className="absolute inset-0 flex items-center justify-center pb-1">
                <div className="w-3.5 h-4 bg-blue-500 rounded-sm relative mt-2">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2.5 border-2 border-blue-500 rounded-t-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-12 py-10">
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-3">Forgot Password?</h1>
            <p className="text-base text-slate-500 text-center max-w-80 mx-auto mb-10 leading-relaxed">
              Enter your email address to receive a password reset code.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-100 mx-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="forgot-email"
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

              <button
                id="forgot-submit"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3.5 rounded-full shadow-sm"
              >
                Send Code
              </button>
            </form>

            <div className="text-center mt-8 pb-2">
              <Link
                to="/login"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} className="stroke-[3px]" /> Back to Log In
              </Link>
            </div>
          </div>
        </div>
      </AnimatedContent>
    </div>
  )
}
