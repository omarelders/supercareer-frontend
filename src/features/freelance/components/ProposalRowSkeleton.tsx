export default function ProposalRowSkeleton() {
  return (
    <div className="grid grid-cols-proposal-table gap-4 items-center px-8 py-5 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
        <div className="h-4 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded bg-slate-100" />
      </div>
    </div>
  )
}
