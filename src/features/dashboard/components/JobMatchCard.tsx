import type { DashboardJobMatch } from '@/services/dashboardApi'

interface JobMatchCardProps {
  job: DashboardJobMatch
}

export default function JobMatchCard({ job }: JobMatchCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: job.logoColor }}
        >
          {job.logo}
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

      <button className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-full hover:bg-blue-700 active:scale-95 transition-all mt-auto">
        View Match &amp; Apply
      </button>
    </div>
  )
}
