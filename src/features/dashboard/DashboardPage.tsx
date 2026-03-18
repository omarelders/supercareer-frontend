import { useEffect } from 'react'
import { ArrowRight, LayoutGrid, MoreVertical, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchDashboardOverview, selectDashboardState } from '@/store/slices/dashboardSlice'
import {
  JobMatchCard,
  JobMatchCardSkeleton,
  ProjectRowSkeleton,
  StatusBadge,
  StatsCardsSkeleton,
} from './components'

interface StatCardData {
  label: string
  value: string
  trend?: string
  trendClassName?: string
}

function StatsCards({ cards }: { cards: StatCardData[] }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-dashboard-card flex flex-col gap-2"
        >
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{card.label}</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-slate-900 leading-none">{card.value}</span>
            {card.trend ? (
              <div className={`text-sm font-bold mb-1 ${card.trendClassName ?? 'text-slate-500'}`}>
                {card.trend}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { jobMatches, projectMatches, stats, isLoading, error } = useAppSelector(selectDashboardState)

  useEffect(() => {
    dispatch(fetchDashboardOverview())
  }, [dispatch])

  const statCards: StatCardData[] = stats
    ? [
        {
          label: 'Matches Today',
          value: String(stats.matchesToday),
          trend: `${stats.matchesTodayChange}%`,
          trendClassName: 'text-emerald-500',
        },
        {
          label: 'Avg. Match Score',
          value: `${stats.avgMatchScore}%`,
          trend: `${stats.avgMatchScoreChange}%`,
          trendClassName: 'text-emerald-500',
        },
        {
          label: 'Active Proposals',
          value: String(stats.activeProposals),
          trend: 'Stable',
          trendClassName: 'text-slate-500',
        },
        {
          label: 'Profile Views',
          value: String(stats.profileViews),
          trend: `${stats.profileViewsChange}%`,
          trendClassName: 'text-emerald-500',
        },
      ]
    : [
        { label: 'Matches Today', value: '--' },
        { label: 'Avg. Match Score', value: '--' },
        { label: 'Active Proposals', value: '--' },
        { label: 'Profile Views', value: '--' },
      ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <section className="flex flex-col gap-8 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Omar!</h1>
          <p className="text-slate-500 text-base mt-1">
            Our AI found <span className="text-blue-500 font-medium">12 new matches</span> for your
            profile today.
          </p>
        </div>

        {isLoading ? <StatsCardsSkeleton /> : <StatsCards cards={statCards} />}
      </section>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles size={18} className="text-blue-500" />
            Recent Job Matches
          </h2>
          <Link
            to={ROUTES.jobs.jobMatch}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => <JobMatchCardSkeleton key={index} />)
            : jobMatches.map((job) => <JobMatchCard key={job.id} job={job} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <LayoutGrid size={18} className="text-blue-500" />
            Recent Project Matches
          </h2>
          <Link
            to={ROUTES.freelance.projectMatch}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-dashboard-table gap-4 px-7 py-3.5 border-b border-slate-100 bg-slate-50/60">
            {['PROJECT', 'CLIENT', 'STATUS', 'DATE SENT', ''].map((col) => (
              <span key={col} className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {col}
              </span>
            ))}
          </div>

          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => <ProjectRowSkeleton key={index} />)
            : projectMatches.map((project, index) => (
                <div
                  key={project.id}
                  className={`grid grid-cols-dashboard-table gap-4 items-center px-7 py-5 ${
                    index < projectMatches.length - 1 ? 'border-b border-slate-100' : ''
                  } hover:bg-slate-50 transition-colors`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{project.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{project.subtitle}</p>
                  </div>

                  <p className="text-sm text-slate-600">{project.client}</p>
                  <div>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-slate-500">{project.date}</p>
                  <button aria-label="Project actions" className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded">
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
        </div>
      </section>
    </div>
  )
}
