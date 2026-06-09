import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Clock, ExternalLink, MapPin, Search, User, X, Zap } from 'lucide-react'
import type { ProjectMatch } from '@/services/freelanceApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProjectMatches,
  selectProjectMatchesState,
} from '@/store/slices/freelanceSlice'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortMode = 'relevance' | 'recent'

// ---------------------------------------------------------------------------
// Sorting helpers
// ---------------------------------------------------------------------------

function sortProjects(items: ProjectMatch[], mode: SortMode): ProjectMatch[] {
  const copy = [...items]
  if (mode === 'relevance') {
    return copy.sort((a, b) => b.matchPct - a.matchPct)
  }
  // 'recent': newest posted_date first; fall back to matchPct if dates equal
  return copy.sort((a, b) => {
    const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0
    const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0
    if (dateB !== dateA) return dateB - dateA
    return b.matchPct - a.matchPct
  })
}

// ---------------------------------------------------------------------------
// Sort Dropdown
// ---------------------------------------------------------------------------

function SortDropdown({
  mode,
  onChange,
}: {
  mode: SortMode
  onChange: (m: SortMode) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const labels: Record<SortMode, string> = {
    relevance: 'Relevance',
    recent: 'Most Recent',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-100 text-blue-500 hover:text-blue-600 hover:bg-sky-200 text-xs font-bold transition-colors select-none"
      >
        Sort: {labels[mode]}
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {(Object.keys(labels) as SortMode[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors
                ${mode === key
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {mode === key && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mb-px" />
              )}
              {labels[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: ProjectMatch }) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase">
            <Zap size={10} className="fill-blue-600" />
            {project.matchPct}% MATCH
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 font-medium flex-wrap">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-slate-400" />
            <span>{project.client}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{project.postedTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-400" />
            <span>{project.location}</span>
          </div>
        </div>

        <div className="relative">
          <p className="text-base leading-relaxed text-slate-600 pt-1 line-clamp-3">
            {project.description}
          </p>
        </div>

        <Link
          to={`/freelance/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors"
        >
          <ChevronDown size={16} /> View Details
        </Link>

        <div className="flex flex-wrap gap-2 pt-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-sm font-medium rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="md:w-50 shrink-0 flex flex-col md:items-end justify-between md:text-right gap-6">
        <div>
          <div className="text-2xl font-bold text-slate-900">{project.budget}</div>
          <div className="text-sm font-medium text-slate-500 mt-1">{project.budgetType}</div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full md:w-auto px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              View Listing <ExternalLink size={13} />
            </a>
          ) : null}
          <Link
            to={`/freelance/create-proposal?projectId=${project.id}`}
            className="w-full md:w-auto px-6 py-2.5 text-white text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Create Proposal
          </Link>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 animate-pulse">
      <div className="flex-1 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-2/3" />
        <div className="flex gap-3">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-24" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 rounded-md bg-slate-100" />
          <div className="h-7 w-20 rounded-md bg-slate-100" />
        </div>
      </div>
      <div className="md:w-50 shrink-0 flex flex-col md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="h-7 bg-slate-200 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
        <div className="h-10 rounded-lg bg-slate-200 w-full md:w-32" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProjectMatchPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, isLoading, error } = useAppSelector(selectProjectMatchesState)
  const [visibleCount, setVisibleCount] = useState(5)
  const [sortMode, setSortMode] = useState<SortMode>('relevance')
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileQuery, setMobileQuery] = useState('')

  // Derive the active search term from the URL ?q= param
  const searchQuery = searchParams.get('q') ?? ''

  // Sync mobile input with URL param on mount / param change
  useEffect(() => {
    setMobileQuery(searchQuery)
  }, [searchQuery])

  // Reset visible count when sort changes so we always start from page 1
  function handleSortChange(mode: SortMode) {
    setSortMode(mode)
    setVisibleCount(5)
  }

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = mobileQuery.trim()
    setSearchParams(trimmed ? { q: trimmed } : {})
    setVisibleCount(5)
  }

  function clearSearch() {
    setSearchParams({})
    setMobileQuery('')
    setVisibleCount(5)
  }

  useEffect(() => {
    dispatch(fetchProjectMatches())
  }, [dispatch])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items
    const q = searchQuery.toLowerCase()
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [items, searchQuery])

  const sorted = useMemo(() => sortProjects(filtered, sortMode), [filtered, sortMode])
  const visible = sorted.slice(0, visibleCount)

  return (
    <div className="max-w-250 mx-auto px-4 md:px-6 py-6 md:py-12 bg-slate-50/50 min-h-screen">

      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-600 p-1"
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-lg font-bold text-slate-900">Project Matches</h1>
        </div>
        <button className="relative p-1 text-slate-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 border-2 border-slate-50" />
        </button>
      </div>

      {/* Mobile Search */}
      <form onSubmit={handleMobileSearch} className="md:hidden mb-6 relative">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={mobileQuery}
          onChange={(e) => setMobileQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all border-none"
        />
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6 border-b border-slate-200">
        <div className="flex items-center gap-4 md:gap-8 -mb-px px-2 overflow-x-auto no-scrollbar">
          <button className="text-blue-600 font-bold pb-4 border-b-2 border-blue-600 text-sm whitespace-nowrap">
            Project matches
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 pb-4 sm:pb-3 px-2 sm:px-0">
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Search size={11} />
              {searchQuery}
              <X size={11} />
            </button>
          )}
          <div className="px-4 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 bg-white shadow-sm">
            {sorted.length} Matches Found
          </div>
          <SortDropdown mode={sortMode} onChange={handleSortChange} />
        </div>
      </div>

      {/* Mobile Filter Pills */}
      <div className="flex md:hidden gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => {
            setSortMode('relevance')
            setVisibleCount(5)
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-sm transition-colors
            ${sortMode === 'relevance'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All Matches
        </button>
        <button
          onClick={() => handleSortChange('relevance')}
          className={`px-4 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium whitespace-nowrap shadow-sm transition-colors
            ${sortMode === 'relevance'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          High Score <Zap size={11} className={sortMode === 'relevance' ? 'fill-white' : 'fill-slate-400'} />
        </button>
        <button
          onClick={() => handleSortChange('recent')}
          className={`px-4 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium whitespace-nowrap shadow-sm transition-colors
            ${sortMode === 'recent'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Recent <Clock size={11} />
        </button>
      </div>

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <ProjectCardSkeleton key={index} />)
          : error
          ? <p className="text-sm text-red-500">{error}</p>
          : visible.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>

      {!isLoading && !error && sorted.length > visibleCount && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            Load More Matches
          </button>
        </div>
      )}
    </div>
  )
}
