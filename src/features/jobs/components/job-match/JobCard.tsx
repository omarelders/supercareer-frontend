import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Cloud,
  Database,
  Info,
  Palette,
  Share2,
  Terminal,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JobIconName, JobMatch } from '@/services/jobsApi'
import type { JobViewMode } from '@/store/slices/jobsSlice'

const ICON_MAP: Record<JobIconName, LucideIcon> = {
  Cloud,
  Terminal,
  Share2,
  Database,
  BarChart2,
  Palette,
}

interface JobCardProps {
  job: JobMatch
  viewMode: JobViewMode
}

export default function JobCard({ job, viewMode }: JobCardProps) {
  const IconComponent = ICON_MAP[job.iconName]

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start md:justify-between gap-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <IconComponent size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                <p className="text-sm text-slate-500">
                  {job.company} · {job.location} · {job.jobType}
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide">
              {job.matchPct}% Match
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {job.features.map((feature, index) => (
              <div key={`${job.id}-feature-${index}`} className="flex items-start gap-2.5">
                {feature.type === 'check' ? (
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-px" />
                ) : (
                  <Info size={16} className="text-slate-300 shrink-0 mt-px" />
                )}
                <span className="text-sm text-slate-600 leading-tight">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors md:w-44 shrink-0"
        >
          View Job <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <IconComponent size={20} className="text-blue-500" />
        </div>
        <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide">
          {job.matchPct}% Match
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
        <p className="text-sm text-slate-500">
          {job.company} · {job.location} · {job.jobType}
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {job.features.map((feature, index) => (
          <div key={`${job.id}-feature-${index}`} className="flex items-start gap-2.5">
            {feature.type === 'check' ? (
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-px" />
            ) : (
              <Info size={16} className="text-slate-300 shrink-0 mt-px" />
            )}
            <span className="text-sm text-slate-600 leading-tight">{feature.text}</span>
          </div>
        ))}
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors mt-auto"
      >
        View Job <ArrowRight size={16} />
      </Link>
    </div>
  )
}
