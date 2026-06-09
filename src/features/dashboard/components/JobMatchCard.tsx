import type { DashboardJobMatch } from '@/services/dashboardApi'
import {
  Briefcase,
  Terminal,
  Settings,
  BarChart2,
  Palette,
  User,
} from 'lucide-react'

// Helper to determine the best icon and color scheme based on title & platform
function getJobIcon(title: string, platform: string) {
  const t = title.toLowerCase()

  // 1. Creative, Design, Writing
  if (
    t.includes('design') ||
    t.includes('ui') ||
    t.includes('ux') ||
    t.includes('art') ||
    t.includes('creative') ||
    t.includes('writer') ||
    t.includes('content') ||
    t.includes('copywriter')
  ) {
    return {
      Icon: Palette,
      bgClass: 'bg-pink-50 border-pink-100',
      iconClass: 'text-pink-600',
    }
  }

  // 2. Data, Planning, Finance, Analytics
  if (
    t.includes('data') ||
    t.includes('analyst') ||
    t.includes('analytics') ||
    t.includes('planning') ||
    t.includes('specialist') ||
    t.includes('finance') ||
    t.includes('accountant') ||
    t.includes('audit')
  ) {
    return {
      Icon: BarChart2,
      bgClass: 'bg-emerald-50 border-emerald-100',
      iconClass: 'text-emerald-600',
    }
  }

  // 3. Tech & Software Development
  if (
    t.includes('software') ||
    t.includes('developer') ||
    t.includes('web') ||
    t.includes('backend') ||
    t.includes('frontend') ||
    t.includes('react') ||
    t.includes('vue') ||
    t.includes('node') ||
    t.includes('coder') ||
    t.includes('coding') ||
    t.includes('program')
  ) {
    return {
      Icon: Terminal,
      bgClass: 'bg-violet-50 border-violet-100',
      iconClass: 'text-violet-600',
    }
  }

  // 4. Engineering & Technical Roles
  if (
    t.includes('engineer') ||
    t.includes('engineering') ||
    t.includes('technical') ||
    t.includes('mechanical') ||
    t.includes('electrical') ||
    t.includes('civil') ||
    t.includes('architect')
  ) {
    return {
      Icon: Settings,
      bgClass: 'bg-blue-50 border-blue-100',
      iconClass: 'text-blue-600',
    }
  }

  // 5. Admin, Support, HR, Receptionist
  if (
    t.includes('receptionist') ||
    t.includes('support') ||
    t.includes('customer') ||
    t.includes('service') ||
    t.includes('admin') ||
    t.includes('assistant') ||
    t.includes('hr') ||
    t.includes('recruiter') ||
    t.includes('office')
  ) {
    return {
      Icon: User,
      bgClass: 'bg-amber-50 border-amber-100',
      iconClass: 'text-amber-600',
    }
  }

  // Default Fallback
  return {
    Icon: Briefcase,
    bgClass: 'bg-slate-50 border-slate-100',
    iconClass: 'text-slate-600',
  }
}

interface JobMatchCardProps {
  job: DashboardJobMatch
}

export default function JobMatchCard({ job }: JobMatchCardProps) {
  const { Icon, bgClass, iconClass } = getJobIcon(job.title, job.platform)

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 ${bgClass}`}>
          <Icon className={iconClass} size={20} />
        </div>

        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {job.matchPct}% Match
        </span>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 text-base">{job.title}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {job.platform} · {job.location}
        </p>
      </div>

      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold tracking-wide text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => job.sourceUrl && window.open(job.sourceUrl, '_blank')}
        className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-full hover:bg-blue-700 active:scale-95 transition-all mt-auto"
      >
        Match &amp; Apply
      </button>
    </div>
  )
}

