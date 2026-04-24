import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { fetchProjects, type ApiProject } from '@/services/opportunitiesApi'
import { mapApiProjectToProjectMatch } from '@/services/freelanceApi'
import type { ProjectMatch } from '@/services/freelanceApi'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function guessLevel(description: string, matchPct: number): string {
  const lower = description.toLowerCase()
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('expert')) return 'Expert'
  if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-level'
  if (lower.includes('junior') || lower.includes('entry')) return 'Junior'
  if (matchPct >= 90) return 'Expert'
  if (matchPct >= 75) return 'Mid-level'
  return 'Open'
}

function guessDeliverables(description: string): string[] {
  // Pull out bullet/numbered lines or extract sentences that are deliverable-like
  const bulletLines = description
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter((l) => l.length > 10 && l.length < 120)

  if (bulletLines.length >= 3) return bulletLines.slice(0, 4)

  // Fallback: pick descriptive sentence fragments
  return description
    .replace(/\n+/g, ' ')
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 120)
    .slice(1, 5)
}

function techColor(tech: string): string {
  const TECH_COLORS: Record<string, string> = {
    react:      'bg-sky-50   text-sky-700   border-sky-100',
    typescript: 'bg-blue-50  text-blue-700  border-blue-100',
    node:       'bg-green-50 text-green-700 border-green-100',
    python:     'bg-yellow-50 text-yellow-700 border-yellow-100',
    graphql:    'bg-pink-50  text-pink-700  border-pink-100',
    next:       'bg-slate-100 text-slate-700 border-slate-200',
    tailwind:   'bg-cyan-50  text-cyan-700  border-cyan-100',
    jest:       'bg-red-50   text-red-700   border-red-100',
    aws:        'bg-orange-50 text-orange-700 border-orange-100',
    postgresql: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    mongodb:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  }
  const key = Object.keys(TECH_COLORS).find((k) => tech.toLowerCase().includes(k))
  return key ? TECH_COLORS[key] : 'bg-slate-50 text-slate-600 border-slate-200'
}

function guessDuration(project: ApiProject): string {
  if (project.duration) return project.duration
  const d = project.description.toLowerCase()
  if (/3\s*month/i.test(d)) return '3 Months'
  if (/6\s*month/i.test(d)) return '6 Months'
  if (/12\s*month|year/i.test(d)) return '12 Months'
  if (/week/i.test(d)) return '2-4 Weeks'
  return '2 Months'
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ProjectDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-slate-100 rounded" />
      <div className="space-y-3">
        <div className="h-9 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-4 bg-slate-100 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<ProjectMatch | null>(null)
  const [rawProject, setRawProject] = useState<ApiProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchProjects()
      .then((projects) => {
        if (cancelled) return
        const found = projects.find((p) => String(p.id) === id)
        if (!found) {
          setError('Project not found.')
          return
        }
        setRawProject(found)
        setProject(mapApiProjectToProjectMatch(found))
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load project details.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  if (isLoading) return <ProjectDetailSkeleton />

  if (error || !project || !rawProject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <p className="text-slate-500 text-sm">{error ?? 'Something went wrong.'}</p>
        <button
          onClick={() => navigate('/freelance/project-match')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Projects
        </button>
      </div>
    )
  }

  const deliverables = guessDeliverables(rawProject.description)
  const level = guessLevel(rawProject.description, project.matchPct)
  const duration = guessDuration(rawProject)
  const allSkills = rawProject.required_skills.length > 0
    ? rawProject.required_skills
    : project.tags

  // Build role description (first 2 paragraphs)
  const paragraphs = rawProject.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const descParagraphs = paragraphs.length >= 2 ? paragraphs.slice(0, 2) : paragraphs

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <button
          onClick={() => navigate('/freelance/project-match')}
          className="hover:text-slate-600 transition-colors"
        >
          Projects
        </button>
        <span>›</span>
        <span className="text-blue-600 font-medium truncate max-w-xs">{project.title}</span>
      </nav>

      {/* Title + CTA row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{project.title}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-2">
            <Clock size={13} />
            {project.postedTime}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            to={`/freelance/create-proposal?projectId=${rawProject.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-sm transition-colors"
          >
            <Sparkles size={15} /> Create Proposal
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Budget */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
            <DollarSign size={16} className="text-blue-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Budget Range</p>
          <p className="text-base font-bold text-slate-900 leading-tight">{project.budget}</p>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Duration</p>
          <p className="text-base font-bold text-slate-900 leading-tight">{duration}</p>
        </div>

        {/* Level */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Level</p>
          <p className="text-base font-bold text-slate-900 leading-tight">{level}</p>
        </div>

        {/* Match score */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
            <Target size={16} className="text-blue-500" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Match Score</p>
          <p className="text-2xl font-bold text-blue-600 leading-none">{project.matchPct}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Excellent fit for your skill set</p>
        </div>
      </div>

      {/* Project Description */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Project Description</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          {descParagraphs.map((para, i) => (
            <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
          ))}
        </div>
      </section>

      {/* Key Deliverables */}
      {deliverables.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Key Deliverables</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliverables.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-start gap-3"
              >
                <CheckCircle2 size={17} className="text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Required Skills */}
      {allSkills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <span
                key={skill}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border ${techColor(skill)}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mt-2 pb-8"
      >
        <ArrowLeft size={15} />
        Back to matches
      </button>
    </div>
  )
}
