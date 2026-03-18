import { Zap } from 'lucide-react'

interface LogoProps {
  className?: string
  textClassName?: string
}

export default function Logo({ 
  className = '', 
  textClassName = 'text-slate-900' 
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
        <Zap size={16} className="text-white" />
      </div>
      <span className={`font-semibold text-base whitespace-nowrap ${textClassName}`}>Super Career</span>
    </div>
  )
}
