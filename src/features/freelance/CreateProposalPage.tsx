import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react'
import api from '@/services/api'
import {
  createProposal,
  fetchProjects,
  generateProposal,
  type ApiProject,
} from '@/services/opportunitiesApi'
import { mapApiProjectToProjectMatch } from '@/services/freelanceApi'
import { useAuth } from '@/context/AuthContext'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ProfileResponse {
  full_name?: string
  username?: string
  email?: string
  professional_title?: string
  location?: string
  bio?: string
  specialization?: string
  experience?: string
  skills?: string[]
  experiences?: Array<{
    job_title: string
    company: string
    description: string
    start_date: string
    end_date: string
    is_current: boolean
  }>
}

function getDefaultProject(): ApiProject {
  return {
    id: 0,
    title: 'Your Project',
    description: 'A professional project that needs a tailored proposal.',
    budget: 'Not specified',
    deadline: 'Not specified',
    duration: 'Not specified',
    status: 'Open',
    required_skills: [],
    platform_name: 'the client',
    source_url: '',
    posted_date: '',
    scraped_at: '',
    match_score: 0,
  }
}

function buildUserProfileText(profile: ProfileResponse | null, displayName: string): string {
  if (!profile) return `Name: ${displayName}`
  const skillsStr = profile.skills?.length ? profile.skills.join(', ') : 'Not specified'
  const expStr = profile.experiences?.map(e => 
    `- ${e.job_title} at ${e.company}: ${e.description}`
  ).join('\n') || 'Not specified'
  
  return [
    `Name: ${profile.full_name || displayName}`,
    `Title: ${profile.professional_title || 'Freelancer'}`,
    `Bio/Summary: ${profile.bio || 'Not specified'}`,
    `Specialization: ${profile.specialization || 'Not specified'}`,
    `Skills: ${skillsStr}`,
    `Experience:\n${expStr}`
  ].join('\n')
}

function buildProjectDetailsText(project: ApiProject): string {
  const skillsStr = project.required_skills?.length ? project.required_skills.join(', ') : 'Not specified'
  return [
    `Project Title: ${project.title}`,
    `Description: ${project.description}`,
    `Budget: ${project.budget || 'Not specified'}`,
    `Duration: ${project.duration || 'Not specified'}`,
    `Required Skills: ${skillsStr}`
  ].join('\n')
}

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: unknown }
    message?: string
    code?: string
  }

  const data = err.response?.data

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>

    if (Array.isArray(record.detail)) {
      const messages = record.detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item) {
            return String((item as { msg?: unknown }).msg ?? '')
          }
          return ''
        })
        .filter(Boolean)

      if (messages.length) return messages.join(' | ')
    }

    const messages = Object.entries(record)
      .map(([field, value]) => {
        if (Array.isArray(value)) {
          return `${field}: ${String(value[0] ?? '')}`
        }
        return `${field}: ${String(value)}`
      })
      .filter((entry) => !entry.endsWith(': '))

    if (messages.length) return messages.join(' | ')
  }

  if (typeof data === 'string' && data.trim()) return data
  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Unable to reach the server. Please check your connection and try again.'
  }

  return err.message ?? 'Failed to generate proposal. Please try again.'
}

// ---------------------------------------------------------------------------
// Animated typing effect hook
// ---------------------------------------------------------------------------

function useTypingEffect(text: string, speed = 12, enabled = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!enabled || !text) return
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    const interval = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, enabled])

  return { displayed, done }
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CreateProposalPage() {
  const { user } = useAuth()
  const displayName =
    (user?.full_name as string | undefined) ??
    (user?.username as string | undefined) ??
    (user?.email as string | undefined) ??
    'Alex Morgan'

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId')

  const [project, setProject] = useState<ApiProject | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId)
  const [projectError, setProjectError] = useState<string | null>(null)

  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [proposalText, setProposalText] = useState('')
  const [typingEnabled, setTypingEnabled] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load the project details if a projectId is provided.
  useEffect(() => {
    if (!projectId) {
      setIsLoadingProject(false)
      return
    }

    let cancelled = false

    fetchProjects()
      .then((projects) => {
        if (cancelled) return
        const found = projects.find((p) => String(p.id) === projectId)
        if (!found) {
          setProjectError('Project not found.')
          return
        }
        setProject(found)
      })
      .catch(() => {
        if (!cancelled) setProjectError('Failed to load project.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProject(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  // Load the richer user profile context for the generation prompt.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setIsLoadingProfile(true)
      try {
        const { data } = await api.get<ProfileResponse>('/api/profile/')
        if (!cancelled) setProfile(data)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setIsLoadingProfile(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-generate once we have enough context.
  useEffect(() => {
    if (isLoadingProfile || generating || proposalText) return
    if (projectId && !project) return
    void handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, projectId, isLoadingProfile])

  const { displayed, done: typingDone } = useTypingEffect(proposalText, 8, typingEnabled)

  async function handleGenerate() {
    setGenerating(true)
    setTypingEnabled(false)
    setProposalText('')
    setGenerationError(null)
    setSubmitted(false)
    setSubmitError(null)

    try {
      const targetProject = project ?? getDefaultProject()
      const userProfileText = buildUserProfileText(profile, displayName)
      const projectDetailsText = buildProjectDetailsText(targetProject)

      const response = await generateProposal({
        user_profile: userProfileText,
        project_details: projectDetailsText,
      })

      setProposalText(response.proposal_text)
      setTypingEnabled(true)
    } catch (error) {
      setGenerationError(getErrorMessage(error))
    } finally {
      setGenerating(false)
    }
  }

  async function handleSendProposal() {
    if (!proposalText || submitting || submitted) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const textToCopy = typingDone ? proposalText : displayed
      await navigator.clipboard.writeText(textToCopy)

      await createProposal({
        project: project?.id ?? null,
        content: proposalText,
        status: 'sent',
      })
      setSubmitted(true)

      if (project?.source_url) {
        window.open(project.source_url, '_blank')
      }
      navigate('/freelance/project-match')
    } catch {
      setSubmitError('Failed to send proposal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCopy() {
    const textToCopy = typingDone ? proposalText : displayed
    void navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const projectMatch = project ? mapApiProjectToProjectMatch(project) : null
  const clientName = project?.platform_name || 'the client'

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Proposal Generator</h1>
        {isLoadingProject ? (
          <p className="text-slate-400 text-sm mt-1 animate-pulse">Loading project details...</p>
        ) : projectError ? (
          <p className="text-red-400 text-sm mt-1">{projectError}</p>
        ) : (
          <p className="text-slate-500 text-base mt-1">
            Crafting a bespoke response for{' '}
            <span className="font-medium text-slate-700">{clientName}</span>
          </p>
        )}
      </div>

      {projectMatch && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
          <Sparkles size={15} className="text-blue-500 shrink-0" />
          <span className="text-slate-700 font-medium truncate">{projectMatch.title}</span>
          <span className="ml-auto shrink-0 text-blue-600 font-bold">{projectMatch.matchPct}% match</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles size={13} className="text-blue-500" />
            AI-generated proposal
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleGenerate()}
              disabled={generating || isLoadingProject || isLoadingProfile}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <Sparkles size={12} />
              {generating ? 'Generating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleCopy}
              disabled={!proposalText && !displayed}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="min-h-[420px] px-6 py-5 relative">
          {generating ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 size={22} className="text-blue-500 animate-spin" />
              </div>
              <p className="text-sm text-slate-400 animate-pulse">Crafting your personalised proposal...</p>
            </div>
          ) : proposalText ? (
            <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
              {typingDone ? proposalText : displayed}
              {!typingDone && (
                <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
              )}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Sparkles size={20} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">Click "Regenerate" to generate a proposal</p>
            </div>
          )}

          {generationError && (
            <p className="mt-4 text-xs text-red-500">{generationError}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => void handleSendProposal()}
          disabled={!typingDone || submitting || submitted}
          className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl text-sm font-semibold shadow-sm transition-colors ${
            submitted
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending...
            </>
          ) : submitted ? (
            <>
              <CheckCircle2 size={15} /> Proposal Sent!
            </>
          ) : (
            <>
              <Send size={15} /> Send Proposal
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/freelance/proposal')}
          className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
        >
          View All Proposals
        </button>
      </div>

      {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}
    </div>
  )
}
