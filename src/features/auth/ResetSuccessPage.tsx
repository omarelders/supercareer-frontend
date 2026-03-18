import { Link } from 'react-router-dom'
import { Check, ShieldCheck } from 'lucide-react'
import AnimatedContent from '@/components/reactbits/AnimatedContent'

export default function ResetSuccessPage() {
  return (
    <div className="w-full max-w-135 mx-auto">
      <AnimatedContent distance={24} duration={0.6} ease="power3.out" className="w-full">
        <div className="bg-white rounded-[calc(var(--radius)+4px)] shadow-sm border border-slate-200 overflow-hidden">
          {/* Top banner */}
          <div className="bg-slate-50 flex items-center justify-center pt-16 pb-12">
            {/* Custom Checkmark icon composite */}
            <div className="w-20 h-20 rounded-7 bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check size={40} className="text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Body */}
          <div className="px-12 py-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">Password Reset<br/>Successful</h1>
            <p className="text-base text-slate-500 mb-10 leading-relaxed max-w-85 mx-auto">
              Your password has been reset successfully. You can now log in to your Super Career account
              with your new credentials and start finding your next big project.
            </p>

            <Link
              id="reset-success-go-to-login"
              to="/login"
              className="block w-full max-w-100 mx-auto bg-blue-600 text-white font-bold text-base py-3.5 rounded-full hover:bg-blue-700 text-center mb-6 shadow-sm"
            >
              Go to Login
            </Link>

            <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors block mb-10">
              Contact Support if you need help
            </Link>

            {/* Secure badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pb-2">
              <ShieldCheck size={16} className="text-slate-400" strokeWidth={2.5} />
              SECURE CONNECTION VERIFIED
            </div>
          </div>
        </div>
      </AnimatedContent>
    </div>
  )
}
