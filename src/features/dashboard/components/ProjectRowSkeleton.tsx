export default function ProjectRowSkeleton() {
  return (
    <div className="grid grid-cols-dashboard-table gap-4 items-center px-7 py-5 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3.5 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
      </div>
      <div className="h-3.5 bg-slate-200 rounded w-2/3" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
      <div className="h-4 w-4 rounded bg-slate-100" />
    </div>
  )
}
