import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { fetchJobs, type ApiJob } from '@/services/opportunitiesApi'
import { mapApiJobToJobMatch } from '@/services/jobsApi'
import type { JobMatch } from '@/services/jobsApi'

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function JobDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Header card skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-100 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-40 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-14 w-24 rounded-xl bg-slate-100" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-3">
          <div className="h-12 flex-1 bg-slate-100 rounded-xl" />
          <div className="h-12 flex-1 bg-slate-100 rounded-xl" />
        </div>
      </div>
      {/* Body skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-4 bg-slate-100 rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tech-stack pill colour map (reuse design system hues)
// ---------------------------------------------------------------------------

const TECH_COLORS: Record<string, string> = {
  react:      'bg-sky-50   text-sky-700   border-sky-100',
  typescript: 'bg-blue-50  text-blue-700  border-blue-100',
  node:       'bg-green-50 text-green-700 border-green-100',
  python:     'bg-yellow-50 text-yellow-700 border-yellow-100',
  graphql:    'bg-pink-50  text-pink-700  border-pink-100',
  next:       'bg-slate-100 text-slate-700 border-slate-200',
  tailwind:   'bg-cyan-50  text-cyan-700  border-cyan-100',
  jest:       'bg-red-50   text-red-700   border-red-100',
  cypress:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  aws:        'bg-orange-50 text-orange-700 border-orange-100',
}

function techColor(tech: string) {
  const key = Object.keys(TECH_COLORS).find((k) => tech.toLowerCase().includes(k))
  return key ? TECH_COLORS[key] : 'bg-slate-50 text-slate-600 border-slate-200'
}

// ---------------------------------------------------------------------------
// Helpers to derive additional fields from raw ApiJob
// ---------------------------------------------------------------------------

function extractTechStack(description: string): string[] {
  const TECHS = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL',
    'Next.js', 'Tailwind CSS', 'Tailwind', 'Jest', 'Cypress', 'AWS',
    'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'Vue',
    'Angular', 'Svelte', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift',
    'Flutter', 'Dart', 'Rails', 'Django', 'FastAPI', 'Laravel',
    'AWS Amplify', 'Graphé L',
  ]
  return TECHS.filter((t) => description.toLowerCase().includes(t.toLowerCase())).slice(0, 8)
}

function extractRequirements(description: string): string[] {
  // Split on newlines and sentence boundaries, keep reasonable chunks
  const bullets = description
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter((l) => l.length > 20 && l.length < 200)
    .slice(0, 6)

  if (bullets.length >= 2) return bullets

  // Fallback: sentence split
  return description
    .replace(/\n+/g, ' ')
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 5)
}

function formatPostedDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffH = Math.floor(diffMs / 3_600_000)
    if (diffH < 1) return 'Just now'
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD} day${diffD > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function guessSalary(description: string): string | null {
  // Very rough heuristic: look for salary patterns like $120k, $120,000, etc.
  const match = description.match(/\$[\d,]+[kK]?\s*[-–]\s*\$[\d,]+[kK]?/)
  return match ? match[0] : null
}

function guessDuration(description: string): string {
  if (/12\+?\s*month/i.test(description)) return '12+ Months'
  if (/6\s*month/i.test(description)) return '6 Months'
  if (/3\s*month/i.test(description)) return '3 Months'
  if (/permanent|full.?time/i.test(description)) return 'Permanent'
  return 'Ongoing'
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [job, setJob] = useState<JobMatch | null>(null)
  const [rawJob, setRawJob] = useState<ApiJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchJobs()
      .then((jobs) => {
        if (cancelled) return
        const found = jobs.find((j) => String(j.id) === id)
        if (!found) {
          setError('Job not found.')
          return
        }
        setRawJob(found)
        setJob(mapApiJobToJobMatch(found))
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load job details.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) return <JobDetailSkeleton />

  if (error || !job || !rawJob) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <p className="text-slate-500 text-sm">{error ?? 'Something went wrong.'}</p>
        <button
          onClick={() => navigate(ROUTES.jobs.jobMatch)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Jobs
        </button>
      </div>
    )
  }

  const techStack = extractTechStack(rawJob.description)
  const requirements = extractRequirements(rawJob.description)
  const postedAgo = formatPostedDate(rawJob.posted_date || rawJob.scraped_at)
  const salaryRange = guessSalary(rawJob.description)
  const duration = guessDuration(rawJob.description)

  // Build a clean role description (first big paragraph or first 4 sentences)
  const roleDescription = rawJob.description
    .replace(/\n{3,}/g, '\n\n')
    .split('\n\n')[0]
    ?.trim()
    ?? rawJob.description.slice(0, 400)

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to matches
      </button>

      {/* ---- Header card ---- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            {/* Company logo placeholder */}
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-blue-500" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{job.title}</h1>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <Building2 size={13} className="shrink-0" />
                {job.company}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <MapPin size={13} className="shrink-0" />
                {rawJob.location}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-slate-400 mt-0.5">
                <Clock size={13} className="shrink-0" />
                {postedAgo}
              </p>
            </div>
          </div>

          {/* Match score badge */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 self-start">
            <Sparkles size={15} className="text-blue-500" />
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 leading-none">{job.matchPct}%</p>
              <p className="text-xs text-blue-500 font-medium mt-0.5">Match</p>
            </div>
          </div>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {salaryRange && (
            <div className="col-span-3 sm:col-span-1 bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Salary Range</p>
              <p className="text-sm font-bold text-slate-800">{salaryRange}</p>
            </div>
          )}
          <div
            className={`${salaryRange ? 'col-span-3 sm:col-span-1' : 'col-span-3 sm:col-span-1'} bg-slate-50 rounded-xl border border-slate-100 px-4 py-3`}
          >
            <p className="text-xs text-slate-400 font-medium mb-0.5">Job Type</p>
            <p className="text-sm font-bold text-slate-800">{job.jobType}</p>
          </div>
          <div
            className={`${salaryRange ? 'col-span-3 sm:col-span-1' : 'col-span-3 sm:col-span-1'} bg-slate-50 rounded-xl border border-slate-100 px-4 py-3`}
          >
            <p className="text-xs text-slate-400 font-medium mb-0.5">Duration</p>
            <p className="text-sm font-bold text-slate-800">{duration}</p>
          </div>
          {!salaryRange && (
            <div className="col-span-3 sm:col-span-1 bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400 font-medium mb-0.5">Location</p>
              <p className="text-sm font-bold text-slate-800">{job.location}</p>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/jobs/custom-cv?jobId=${rawJob.id}`)}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <FileText size={16} />
            Create Custom CV
          </button>
          {rawJob.source_url && (
            <a
              href={rawJob.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              <ExternalLink size={16} />
              View Now
            </a>
          )}
        </div>
      </div>

      {/* ---- Body card ---- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-7">
        {/* The Role */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">The Role</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{roleDescription}</p>
        </section>

        {/* Requirements */}
        {requirements.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Requirements</h2>
            <ul className="space-y-3">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Stack */}
        {techStack.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Technical Stack</h2>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${techColor(tech)}`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
