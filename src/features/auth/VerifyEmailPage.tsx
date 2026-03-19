import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

const CODE_LENGTH = 6
const COUNTDOWN_SECONDS = 60

const verifySchema = z.object({
  digits: z.array(z.string()).length(CODE_LENGTH).refine(
    (arr) => arr.every((d) => d.length === 1 && /\d/.test(d)),
    { message: 'Please enter all 6 digits' }
  ),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || 'your email address'
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      digits: Array(CODE_LENGTH).fill(''),
    },
  })

  const digits = watch('digits')

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...getValues('digits')]
    next[index] = char
    setValue('digits', next, { shouldValidate: true, shouldDirty: true })
    
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    const next = [...getValues('digits')]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setValue('digits', next, { shouldValidate: true })
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  function handleResend() {
    setSeconds(COUNTDOWN_SECONDS)
    setValue('digits', Array(CODE_LENGTH).fill(''), { shouldValidate: false })
  }

  function onSubmit() {
    navigate('/dashboard')
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="w-full max-w-120">
      <AnimatedContent distance={22} duration={0.6} ease="power3.out" className="w-full">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 px-10 py-9">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <MailCheck size={22} className="text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Verify your email</h1>
          <p className="text-sm text-slate-500 text-center mb-7 leading-relaxed">
            We've sent a 6-digit verification code to<br />
            <span className="font-medium text-slate-700">{email}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center gap-2.5 mb-2" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  aria-label={`Verification code digit ${i + 1} of ${CODE_LENGTH}`}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-lg font-semibold rounded-[var(--radius)] border-2 transition-all focus:outline-none ${
                    digit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : errors.digits
                        ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-400'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-400'
                  }`}
                />
              ))}
            </div>
            <div className="h-6 flex items-start justify-center mb-4">
              {errors.digits && (
                <p className="text-sm font-medium text-red-500">{errors.digits.message}</p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mb-7">
              <div className="flex items-end gap-1">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{mm}</div>
                  <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest">MIN</div>
                </div>
                <span className="text-lg font-bold text-slate-500 mb-4">:</span>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{ss}</div>
                  <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest">SEC</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={seconds > 0}
                className="text-sm text-blue-600 font-medium disabled:opacity-40 hover:underline ml-2"
              >
                Resend code
              </button>
            </div>

            <button
              id="verify-submit"
              type="submit"
              disabled={digits.some((d) => !d) || Object.keys(errors).length > 0}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Verify Account →
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Having trouble?{' '}
            <Link to="/" className="text-blue-600 hover:underline">Contact support</Link>
          </p>
        </div>
      </AnimatedContent>
    </div>
  )
}
