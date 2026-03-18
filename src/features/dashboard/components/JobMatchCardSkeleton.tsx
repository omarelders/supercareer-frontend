export default function JobMatchCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-lg bg-slate-200" />
        <div className="w-20 h-6 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-16 rounded bg-slate-100" />
        <div className="h-5 w-20 rounded bg-slate-100" />
      </div>
      <div className="h-10 rounded-full bg-slate-200 mt-auto" />
    </div>
  )
}
