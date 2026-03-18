import type { DashboardProjectMatch } from '@/services/dashboardApi'

const STATUS_STYLES: Record<DashboardProjectMatch['status'], string> = {
  'In Review': 'bg-amber-100 text-amber-700',
  Interviewing: 'bg-purple-100 text-purple-700',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

const STATUS_DOT: Record<DashboardProjectMatch['status'], string> = {
  'In Review': 'bg-amber-500',
  Interviewing: 'bg-purple-500',
  Sent: 'bg-blue-500',
  Accepted: 'bg-green-500',
  Rejected: 'bg-red-500',
}

interface StatusBadgeProps {
  status: DashboardProjectMatch['status']
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
      {status}
    </span>
  )
}
