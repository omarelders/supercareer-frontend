export default function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-dashboard-card flex flex-col gap-3 animate-pulse"
        >
          <div className="h-3 bg-slate-200 rounded w-2/3" />
          <div className="h-9 bg-slate-200 rounded w-1/2 mt-1" />
          <div className="h-3 bg-slate-100 rounded w-1/4 mt-auto" />
        </div>
      ))}
    </div>
  )
}
