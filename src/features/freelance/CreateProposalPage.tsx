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
import { fetchProjects, createProposal, type ApiProject } from '@/services/opportunitiesApi'
import { mapApiProjectToProjectMatch } from '@/services/freelanceApi'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a realistic-looking AI proposal from the project data */
function buildProposalText(project: ApiProject): string {
  const skills = project.required_skills.slice(0, 5).join(', ') || 'relevant technologies'
  return `Dear Hiring Team at ${project.platform_name || 'your company'},

I'm excited to apply for the ${project.title} project. With extensive hands-on experience in ${skills}, I'm confident I can deliver exactly what you're looking for—on time and to the highest standard.

After reviewing your project brief, I understand you need a seasoned professional to handle the complete scope of this engagement. My approach centres on clean, maintainable solutions backed by thorough testing and clear communication throughout every phase.

Here's how I plan to tackle your project:

• Discovery & Planning – I'll start with a deep-dive into your existing codebase and requirements to produce a robust technical specification within the first few days.

• Iterative Development – Working in short cycles, I'll deliver working increments regularly so you can provide feedback early and often, keeping us aligned at every stage.

• Quality Assurance – Every feature ships with automated tests. I won't consider a task done until it's been reviewed, tested, and documented.

• Handover & Support – At project completion I'll provide full documentation, recorded walkthroughs, and a period of post-launch support to ensure a smooth handover.

My track record includes similar engagements where I've delivered measurable improvements in performance, scalability, and user experience. I'd love the opportunity to bring that same rigour to your project.

I'm available to start promptly and am happy to jump on a call to discuss further.

Best regards,
Alex Morgan`
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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const projectId = searchParams.get('projectId')

  const [project, setProject] = useState<ApiProject | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(!!projectId)
  const [projectError, setProjectError] = useState<string | null>(null)

  const [generating, setGenerating] = useState(false)
  const [proposalText, setProposalText] = useState('')
  const [typingEnabled, setTypingEnabled] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Load project details if a projectId is provided
  useEffect(() => {
    if (!projectId) return
    let cancelled = false

    fetchProjects()
      .then((projects) => {
        if (cancelled) return
        const found = projects.find((p) => String(p.id) === projectId)
        if (!found) { setProjectError('Project not found.'); return }
        setProject(found)
      })
      .catch(() => { if (!cancelled) setProjectError('Failed to load project.') })
      .finally(() => { if (!cancelled) setIsLoadingProject(false) })

    return () => { cancelled = true }
  }, [projectId])

  // Auto-generate proposal once project loads
  useEffect(() => {
    if (project && !proposalText) {
      handleGenerate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  const { displayed, done: typingDone } = useTypingEffect(proposalText, 8, typingEnabled)

  function handleGenerate() {
    setGenerating(true)
    setTypingEnabled(false)
    setProposalText('')
    setSubmitted(false)
    setSubmitError(null)

    // Simulate AI generation delay
    setTimeout(() => {
      const text = buildProposalText(
        project ?? {
          id: 0,
          title: 'Your Project',
          description: '',
          budget: '',
          deadline: '',
          duration: '',
          status: '',
          required_skills: [],
          platform_name: 'the client',
          source_url: '',
          posted_date: '',
          scraped_at: '',
          match_score: 0,
        }
      )
      setProposalText(text)
      setGenerating(false)
      setTypingEnabled(true)
    }, 1800)
  }

  async function handleSendProposal() {
    if (!proposalText || submitting || submitted) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createProposal({
        project: project?.id ?? null,
        content: proposalText,
        status: 'sent',
      })
      setSubmitted(true)
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

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Proposal Generator</h1>
        {isLoadingProject ? (
          <p className="text-slate-400 text-sm mt-1 animate-pulse">Loading project details…</p>
        ) : projectError ? (
          <p className="text-red-400 text-sm mt-1">{projectError}</p>
        ) : (
          <p className="text-slate-500 text-base mt-1">
            Crafting a bespoke response for{' '}
            <span className="font-medium text-slate-700">{clientName}</span>
          </p>
        )}
      </div>

      {/* Project summary pill (if loaded) */}
      {projectMatch && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm">
          <Sparkles size={15} className="text-blue-500 shrink-0" />
          <span className="text-slate-700 font-medium truncate">{projectMatch.title}</span>
          <span className="ml-auto shrink-0 text-blue-600 font-bold">{projectMatch.matchPct}% match</span>
        </div>
      )}

      {/* Proposal text area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles size={13} className="text-blue-500" />
            AI-generated proposal
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating || isLoadingProject}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <Sparkles size={12} />
              {generating ? 'Generating…' : 'Regenerate'}
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

        {/* Content area */}
        <div className="min-h-[420px] px-6 py-5 relative">
          {generating ? (
            <div className="flex flex-col items-center justify-center h-72 gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 size={22} className="text-blue-500 animate-spin" />
              </div>
              <p className="text-sm text-slate-400 animate-pulse">Crafting your personalised proposal…</p>
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
        </div>
      </div>

      {/* Actions */}
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
            <><Loader2 size={15} className="animate-spin" /> Sending…</>
          ) : submitted ? (
            <><CheckCircle2 size={15} /> Proposal Sent!</>
          ) : (
            <><Send size={15} /> Send Proposal</>
          )}
        </button>

        <button
          onClick={() => navigate('/freelance/proposal')}
          className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
        >
          View All Proposals
        </button>
      </div>

      {submitError && (
        <p className="text-xs text-red-500 text-center">{submitError}</p>
      )}
    </div>
  )
}
