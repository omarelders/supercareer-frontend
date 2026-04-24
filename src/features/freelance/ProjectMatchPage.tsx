import { useEffect, useState } from 'react'
import { ChevronDown, Clock, ExternalLink, MapPin, User, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectMatch } from '@/services/freelanceApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProjectMatches,
  selectProjectMatchesState,
} from '@/store/slices/freelanceSlice'

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

export default function ProjectMatchPage() {
  const dispatch = useAppDispatch()
  const { items, isLoading, error } = useAppSelector(selectProjectMatchesState)
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    dispatch(fetchProjectMatches())
  }, [dispatch])

  return (
    <div className="max-w-250 mx-auto px-4 md:px-6 py-6 md:py-12 bg-slate-50/50 min-h-screen">
      
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button className="text-slate-600 p-1">
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
      <div className="md:hidden mb-6 relative">
        <svg className="absolute left-3 top-2.5 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Search matched jobs" className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all border-none" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6 border-b border-slate-200">
        <div className="flex items-center gap-4 md:gap-8 -mb-px px-2 overflow-x-auto no-scrollbar">
          <button className="text-blue-600 font-bold pb-4 border-b-2 border-blue-600 text-sm whitespace-nowrap">
            Project matches
          </button>
          <button className="text-slate-500 font-bold pb-4 border-b-2 border-transparent hover:text-slate-700 transition-colors text-sm whitespace-nowrap">
            History
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 pb-4 sm:pb-3 px-2 sm:px-0">
          <div className="px-4 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 bg-white shadow-sm">
            {items.length} Matches Found
          </div>
          <button className="px-4 py-1.5 rounded-full bg-sky-100 text-blue-500 hover:text-blue-600 hover:bg-sky-200 text-xs font-bold transition-colors">
            Sort: Relevance
          </button>
        </div>
      </div>
      
      {/* Mobile Filters */}
      <div className="flex md:hidden gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <button className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium whitespace-nowrap shadow-sm">All Matches</button>
        <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-medium whitespace-nowrap shadow-sm">High Score <ChevronDown size={12} /></button>
        <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-medium whitespace-nowrap shadow-sm">Recent <ChevronDown size={12} /></button>
      </div>

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <ProjectCardSkeleton key={index} />)
          : error
          ? <p className="text-sm text-red-500">{error}</p>
          : items.slice(0, visibleCount).map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>

      {!isLoading && !error && items.length > visibleCount && (
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
