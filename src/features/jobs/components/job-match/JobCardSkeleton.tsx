import type { JobViewMode } from '@/store/slices/jobsSlice'

interface JobCardSkeletonProps {
  viewMode: JobViewMode
}

export default function JobCardSkeleton({ viewMode }: JobCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-3" />
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-5" />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-4/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
        <div className="w-20 h-7 rounded-full bg-slate-200" />
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="flex flex-col gap-3 mb-8">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-5/6" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
      </div>
      <div className="h-11 rounded-lg bg-slate-200 mt-auto" />
    </div>
  )
}
