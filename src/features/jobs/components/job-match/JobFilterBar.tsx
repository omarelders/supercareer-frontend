import { LayoutGrid, LayoutList, ListFilter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  JobFilterState,
  JobViewMode,
  LocationFilter,
  MatchThreshold,
  TypeFilter,
} from '@/store/slices/jobsSlice'

interface JobFilterBarProps {
  filters: JobFilterState
  hasActiveFilters: boolean
  viewMode: JobViewMode
  onLocationChange: (value: LocationFilter) => void
  onTypeChange: (value: TypeFilter) => void
  onMinMatchChange: (value: MatchThreshold) => void
  onClearFilters: () => void
  onViewModeChange: (value: JobViewMode) => void
}

const LOCATION_OPTIONS: Array<{ label: string; value: LocationFilter }> = [
  { label: 'All locations', value: 'All' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' },
]

const TYPE_OPTIONS: Array<{ label: string; value: TypeFilter }> = [
  { label: 'All types', value: 'All' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
]

const MATCH_OPTIONS: Array<{ label: string; value: MatchThreshold }> = [
  { label: 'Any match', value: 0 },
  { label: '90%+', value: 90 },
  { label: '95%+', value: 95 },
]

export default function JobFilterBar({
  filters,
  hasActiveFilters,
  viewMode,
  onLocationChange,
  onTypeChange,
  onMinMatchChange,
  onClearFilters,
  onViewModeChange,
}: JobFilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 pl-2 pr-1 text-slate-700">
          <ListFilter size={18} className="text-slate-400" />
          <span className="text-sm font-bold">Filters:</span>
        </div>

        <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">
          <span>Location</span>
          <select
            value={filters.location}
            onChange={(event) => onLocationChange(event.target.value as LocationFilter)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {LOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">
          <span>Type</span>
          <select
            value={filters.type}
            onChange={(event) => onTypeChange(event.target.value as TypeFilter)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">
          <span>Match</span>
          <select
            value={filters.minMatchPct}
            onChange={(event) => onMinMatchChange(Number(event.target.value) as MatchThreshold)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {MATCH_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:text-slate-300 disabled:hover:text-slate-300"
        >
          Clear all
        </button>
      </div>

      <div className="flex items-center bg-slate-50/80 border border-slate-100 p-1 rounded-lg mr-1 self-start lg:self-auto">
        <button
          onClick={() => onViewModeChange('grid')}
          aria-label="Switch to grid view"
          aria-pressed={viewMode === 'grid'}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            viewMode === 'grid'
              ? 'bg-white shadow-sm border border-slate-100 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <LayoutGrid size={16} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          aria-label="Switch to list view"
          aria-pressed={viewMode === 'list'}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            viewMode === 'list'
              ? 'bg-white shadow-sm border border-slate-100 text-blue-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <LayoutList size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
