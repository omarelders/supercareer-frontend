/** Skeleton shimmer for a single CV table row */
export default function CvRowSkeleton() {
  return (
    <div className="grid grid-cols-cv-table items-center px-6 py-5 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="space-y-1.5">
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-200" />
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="h-4 w-16 rounded bg-slate-100 justify-self-end" />
    </div>
  )
}
