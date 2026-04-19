import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Clock, ExternalLink, Loader2, MapPin, User, Zap } from 'lucide-react'
import type { ProjectMatch } from '@/services/freelanceApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  createProposal,
  fetchProjectMatches,
  selectProjectMatchesState,
} from '@/store/slices/freelanceSlice'

function ProjectCard({ project }: { project: ProjectMatch }) {
  const dispatch = useAppDispatch()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  async function handleSendProposal() {
    if (submitting || submitted) return
    setSubmitting(true)
    try {
      await dispatch(
        createProposal({
          project: project.id,
          content: `Proposal for: ${project.title}`,
          status: 'sent',
        })
      ).unwrap()
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

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
          <p className={`text-base leading-relaxed text-slate-600 pt-1 transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {project.description}
          </p>
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp size={16} /> Show Less</>
          ) : (
            <><ChevronDown size={16} /> View Details</>
          )}
        </button>

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
          <button
            onClick={() => void handleSendProposal()}
            disabled={submitting || submitted}
            className={`w-full md:w-auto px-6 py-2.5 text-white text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-emerald-500 cursor-default'
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-70'
            }`}
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Sending…</>
            ) : submitted ? (
              '✓ Proposal Sent'
            ) : (
              'Send Proposal'
            )}
          </button>
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

  useEffect(() => {
    dispatch(fetchProjectMatches())
  }, [dispatch])

  return (
    <div className="max-w-250 mx-auto px-6 py-8 md:py-12 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-8 -mb-px px-2">
          <button className="text-slate-900 font-bold pb-4 border-b-2 border-blue-600 text-sm">
            Best Matches
          </button>
          <button className="text-slate-500 font-bold pb-4 border-b-2 border-transparent hover:text-slate-700 transition-colors text-sm">
            Most Recent
          </button>
          <button className="text-slate-500 font-bold pb-4 border-b-2 border-transparent hover:text-slate-700 transition-colors text-sm">
            Saved (4)
          </button>
        </div>

        <div className="flex items-center gap-3 pb-4 sm:pb-3 px-2 sm:px-0">
          <div className="px-4 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-500 bg-white shadow-sm">
            24 Matches Found
          </div>
          <button className="px-4 py-1.5 rounded-full bg-sky-100 text-blue-500 hover:text-blue-600 hover:bg-sky-200 text-xs font-bold transition-colors">
            Sort: Relevance
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <ProjectCardSkeleton key={index} />)
          : error
          ? <p className="text-sm text-red-500">{error}</p>
          : items.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  )
}
