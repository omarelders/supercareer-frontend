import { useEffect } from 'react'
import {
  Activity,
  Database,
  Users,
  ShieldAlert,
  BarChart3,
  UserCog,
  ShieldCheck,
  User,
  AlertCircle,
  ClipboardList,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProfileData, selectProfileState, toggleBlockUser } from '@/store/slices/profileSlice'

// ---------------------------------------------------------------------------
// Skeleton helpers
// ---------------------------------------------------------------------------

function SkeletonLine({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} bg-slate-200 rounded animate-pulse`} />
}

function StatsCardsSkeleton({ cols = 4 }: { cols?: 2 | 4 }) {
  const gridClass = cols === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
  return (
    <div className={`grid ${gridClass} gap-4`}>
      {Array.from({ length: cols === 2 ? 4 : 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-dashboard-card flex flex-col gap-3 animate-pulse"
        >
          <SkeletonLine w="w-2/3" h="h-3" />
          <SkeletonLine w="w-1/2" h="h-9" />
          <SkeletonLine w="w-1/4" h="h-2.5" />
        </div>
      ))}
    </div>
  )
}

function TableRowSkeleton({ cols }: { cols: number }) {
  const widths = ['w-full', 'w-3/4', 'w-1/2', 'w-1/3', 'w-1/4']
  return (
    <div className="flex gap-4 items-center px-7 py-4 border-b border-slate-100 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1">
          <SkeletonLine w={widths[i % widths.length]} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
      <Icon size={32} strokeWidth={1.5} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stats cards
// ---------------------------------------------------------------------------

interface StatCardData {
  label: string
  value: string
  icon?: React.ElementType
  accent?: string
}

function StatsCards({ cards }: { cards: StatCardData[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-dashboard-card flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {card.label}
          </h3>
          <span className={`text-4xl font-bold leading-none ${card.accent ?? 'text-slate-900'}`}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

function RoleBadge({ role, isBlocked }: { role: string; isBlocked: boolean }) {
  if (isBlocked) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Blocked
      </span>
    )
  }
  const styles: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    job_seeker: 'bg-blue-100 text-blue-700',
    freelancer: 'bg-teal-100 text-teal-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
        styles[role] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {role.replace(/_/g, ' ')}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Scraping status badge
// ---------------------------------------------------------------------------

function ScrapingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
    running: 'bg-amber-100 text-amber-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
        styles[status.toLowerCase()] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className="text-blue-500" />
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const {
    dashboardStats,
    adminActivities,
    adminScrapingLogs,
    adminStats,
    adminUsers,
    blockedUserIds,
    sectionErrors,
    isLoading,
    error,
  } = useAppSelector(selectProfileState)

  useEffect(() => {
    dispatch(fetchProfileData())
  }, [dispatch])

  const handleToggleBlock = (userId: number) => {
    dispatch(toggleBlockUser(userId))
  }

  // ---- Account stats cards (from GET /api/accounts/dashboard-stats/) ----
  const accountStatsCards: StatCardData[] = dashboardStats
    ? [
        { label: 'Matches Today', value: String(dashboardStats.matches_today), accent: 'text-blue-600' },
        { label: 'Active Proposals', value: String(dashboardStats.active_proposals) },
        { label: 'Avg Match Score', value: `${dashboardStats.avg_match_score}%`, accent: 'text-emerald-600' },
        { label: 'Profile Views', value: String(dashboardStats.profile_views) },
      ]
    : [
        { label: 'Matches Today', value: '--' },
        { label: 'Active Proposals', value: '--' },
        { label: 'Avg Match Score', value: '--' },
        { label: 'Profile Views', value: '--' },
      ]

  // ---- Platform stats cards (from GET /api/admin-tools/stats/) ----
  const platformStatsCards: StatCardData[] = adminStats
    ? [
        { label: 'Total Users', value: String(adminStats.total_users) },
        { label: 'Total Jobs', value: String(adminStats.total_jobs) },
        { label: 'Total Projects', value: String(adminStats.total_projects) },
        {
          label: 'Active / Blocked',
          value: `${adminStats.active_users} / ${adminStats.blocked_users}`,
          accent: 'text-slate-700',
        },
      ]
    : [
        { label: 'Total Users', value: '--' },
        { label: 'Total Jobs', value: '--' },
        { label: 'Total Projects', value: '--' },
        { label: 'Active / Blocked', value: '--' },
      ]

  // ---- Derive the display name ----
  const displayName = dashboardStats?.user_name || 'Admin'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">

      {/* ── Profile Hero ── */}
      <section className="bg-white rounded-2xl border border-slate-200 p-7 shadow-dashboard-card flex items-center gap-6">
        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <SkeletonLine w="w-40" h="h-5" />
              <SkeletonLine w="w-64" h="h-3" />
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 select-none">
              {initials || <User size={28} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {displayName}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Manage platform settings, monitor user activity, and review your personal statistics.
              </p>
            </div>
          </>
        )}
      </section>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── My Account Stats (GET /api/accounts/dashboard-stats/) ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <UserCog size={14} /> My Account Stats
        </h2>
        {sectionErrors.dashboardStats && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <AlertCircle size={13} /> {sectionErrors.dashboardStats}
          </p>
        )}
        {isLoading ? <StatsCardsSkeleton /> : <StatsCards cards={accountStatsCards} />}
      </section>

      {/* ── Platform Stats (GET /api/admin-tools/stats/) ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart3 size={14} /> Platform Stats
        </h2>
        {sectionErrors.adminStats && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <AlertCircle size={13} /> {sectionErrors.adminStats}
          </p>
        )}
        {isLoading ? <StatsCardsSkeleton /> : <StatsCards cards={platformStatsCards} />}
      </section>

      {/* ── User Management (GET /api/admin-tools/users/ + POST toggle-block) ── */}
      <section>
        <SectionHeader icon={Users} title="User Management" />
        {sectionErrors.adminUsers && (
          <p className="text-xs text-amber-600 mb-3 flex items-center gap-1.5">
            <AlertCircle size={13} /> {sectionErrors.adminUsers}
          </p>
        )}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1.5fr_2fr_1fr_130px] gap-4 px-7 py-3.5 border-b border-slate-100 bg-slate-50/60">
            {['USER', 'EMAIL', 'ROLE', 'ACTIONS'].map((col) => (
              <span key={col} className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {col}
              </span>
            ))}
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
          ) : adminUsers.length === 0 ? (
            <EmptyState icon={Users} message="No users found." />
          ) : (
            adminUsers.map((user, index) => {
              const isBlocked = blockedUserIds.includes(user.id)
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-[1.5fr_2fr_1fr_130px] gap-4 items-center px-7 py-4 ${
                    index < adminUsers.length - 1 ? 'border-b border-slate-100' : ''
                  } hover:bg-slate-50/70 transition-colors`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user.username}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  <div>
                    <RoleBadge role={user.role} isBlocked={isBlocked} />
                  </div>
                  <div>
                    <button
                      id={`toggle-block-user-${user.id}`}
                      onClick={() => handleToggleBlock(user.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${
                        isBlocked
                          ? 'text-emerald-700 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50'
                          : 'text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {isBlocked ? (
                        <ShieldCheck size={13} className="text-emerald-500" />
                      ) : (
                        <ShieldAlert size={13} className="text-slate-400" />
                      )}
                      {isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ── Admin Activity (GET /api/admin-tools/activities/) ── */}
      <section>
        <SectionHeader icon={Activity} title="Recent Administrative Activity" />
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1fr] gap-4 px-7 py-3.5 border-b border-slate-100 bg-slate-50/60">
            {['ADMIN', 'ACTION', 'TARGET USER', 'DATE'].map((col) => (
              <span key={col} className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {col}
              </span>
            ))}
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
          ) : adminActivities.length === 0 ? (
            <EmptyState icon={ClipboardList} message="No activity found." />
          ) : (
            adminActivities.map((act, index) => (
              <div
                key={act.id}
                className={`grid grid-cols-[1.5fr_1.5fr_2fr_1fr] gap-4 items-center px-7 py-4 ${
                  index < adminActivities.length - 1 ? 'border-b border-slate-100' : ''
                } hover:bg-slate-50/70 transition-colors`}
              >
                <p className="text-sm font-medium text-slate-800">{act.admin_name}</p>
                <p className="text-sm text-slate-600">{act.action}</p>
                <p className="text-sm text-slate-500">{act.target_user_name || '—'}</p>
                <p className="text-sm text-slate-400">
                  {new Date(act.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Scraping Logs (GET /api/admin-tools/scraping-logs/) ── */}
      <section>
        <SectionHeader icon={Database} title="Scraping Logs" />
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_2fr_1fr] gap-4 px-7 py-3.5 border-b border-slate-100 bg-slate-50/60">
            {['SOURCE', 'STATUS', 'DETAILS', 'DATE'].map((col) => (
              <span key={col} className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                {col}
              </span>
            ))}
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
          ) : adminScrapingLogs.length === 0 ? (
            <EmptyState icon={Database} message="No scraping logs found." />
          ) : (
            adminScrapingLogs.map((log, index) => (
              <div
                key={log.id}
                className={`grid grid-cols-[1fr_1fr_2fr_1fr] gap-4 items-center px-7 py-4 ${
                  index < adminScrapingLogs.length - 1 ? 'border-b border-slate-100' : ''
                } hover:bg-slate-50/70 transition-colors`}
              >
                <p className="text-sm font-medium text-slate-800">{log.source_name}</p>
                <div>
                  <ScrapingStatusBadge status={log.status} />
                </div>
                <p className="text-sm text-slate-600 truncate" title={log.details}>
                  {log.details || '—'}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(log.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
