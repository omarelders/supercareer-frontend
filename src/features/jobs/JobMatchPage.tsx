import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearJobFilters,
  fetchInitialJobMatches,
  loadMoreJobMatches,
  selectHasActiveJobFilters,
  selectJobsState,
  setJobFilters,
  setJobViewMode,
} from '@/store/slices/jobsSlice'
import { JobCard, JobCardSkeleton, JobFilterBar } from './components/job-match'

export default function JobMatchPage() {
  const dispatch = useAppDispatch()
  const {
    items,
    total,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    error,
    loadMoreError,
    viewMode,
    filters,
  } = useAppSelector(selectJobsState)
  const hasActiveFilters = useAppSelector(selectHasActiveJobFilters)

  useEffect(() => {
    dispatch(fetchInitialJobMatches())
  }, [dispatch, filters.location, filters.type, filters.minMatchPct])

  const cardsLayoutClass =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'flex flex-col gap-4'
  const skeletonCount = viewMode === 'grid' ? 6 : 3
  const containerSpanClass = viewMode === 'grid' ? 'col-span-3' : ''

  return (
    <div className="max-w-6xl mx-auto px-2 py-6">
      <JobFilterBar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        viewMode={viewMode}
        onLocationChange={(value) => dispatch(setJobFilters({ location: value }))}
        onTypeChange={(value) => dispatch(setJobFilters({ type: value }))}
        onMinMatchChange={(value) => dispatch(setJobFilters({ minMatchPct: value }))}
        onClearFilters={() => dispatch(clearJobFilters())}
        onViewModeChange={(mode) => dispatch(setJobViewMode(mode))}
      />

      <div className={cardsLayoutClass}>
        {isInitialLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <JobCardSkeleton key={index} viewMode={viewMode} />
            ))
          : error
          ? (
            <div className={cn(containerSpanClass, 'flex flex-col items-center gap-3 py-6')}>
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => void dispatch(fetchInitialJobMatches())}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              >
                Retry
              </button>
            </div>
          )
          : items.length === 0
          ? (
            <div className={cn(containerSpanClass, 'flex flex-col items-center gap-3 py-8')}>
              <p className="text-sm text-slate-500">No matches found for the selected filters.</p>
              <button
                onClick={() => dispatch(clearJobFilters())}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )
          : items.map((job) => <JobCard key={job.id} job={job} viewMode={viewMode} />)}
      </div>

      {!isInitialLoading && !error && items.length > 0 && (
        <div className="flex flex-col items-center mt-10 mb-8 gap-3">
          <p className="text-sm text-slate-500">
            Showing {items.length} of {total} matches
          </p>
          {loadMoreError ? <p className="text-sm text-red-500">{loadMoreError}</p> : null}
          {hasMore ? (
            <button
              onClick={() => void dispatch(loadMoreJobMatches())}
              disabled={isLoadingMore}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Matches'}
            </button>
          ) : (
            <p className="text-sm text-slate-500">You have reached the end of the matches.</p>
          )}
        </div>
      )}
    </div>
  )
}
