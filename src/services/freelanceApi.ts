import {
  fetchProjects,
  createProposal as apiCreateProposal,
  type ApiProject,
  type CreateProposalPayload,
  type ApiProposal,
} from './opportunitiesApi'
import {
  fetchDocumentProposals,
  fetchDocumentProposalById,
  patchDocumentProposal,
  type DocApiProposal,
  type DocProposalStatus,
  type PatchProposalPayload,
} from './documentsApi'



export interface ProjectMatch {
  id: number
  title: string
  matchPct: number
  budget: string
  budgetType: string
  client: string
  postedTime: string
  location: string
  description: string
  tags: string[]
  /** Original source URL so users can open the listing */
  sourceUrl?: string
  /** Platform where the project was posted */
  platform?: string
  /** Raw deadline string */
  deadline?: string
}

export interface Proposal {
  id: number
  date: string
  title: string
  status: 'Sent' | 'In Review' | 'Accepted' | 'Rejected'
  client: string
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Parse an ISO or date-only string and return a relative label. */
function relativePostedTime(dateStr: string): string {
  try {
    const posted = new Date(dateStr)
    const diffMs = Date.now() - posted.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `Posted ${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Posted 1d ago'
    if (diffDays < 7) return `Posted ${diffDays}d ago`
    return `Posted ${Math.floor(diffDays / 7)}w ago`
  } catch {
    return 'Posted recently'
  }
}

/** Determine whether a budget string is hourly or fixed. */
function parseBudgetType(budget: string): { amount: string; type: string } {
  if (!budget || budget === '0' || budget === '0.00') {
    return { amount: 'Negotiable', type: 'Budget TBD' }
  }

  const lower = budget.toLowerCase()
  const isHourly = lower.includes('/hr') || lower.includes('hour') || lower.includes('hourly')
  const type = isHourly ? 'Hourly Rate' : 'Fixed Budget'

  // If the string contains multiple numbers (like a range "50-100") or 
  // already has formatting like currency/commas, we should be conservative.
  const hasRangeSeparator = budget.includes('-') || budget.includes('–') || lower.includes(' to ')
  const digitGroups = budget.match(/\d+/g) || []
  
  // If it's a clear range or already complex, return it as-is to avoid mangling
  if (hasRangeSeparator || digitGroups.length > 1 || budget.includes('$')) {
    return { amount: budget, type }
  }

  // If it's a raw numeric string, format it with currency and thousands separators
  const numeric = parseFloat(budget.replace(/[^0-9.]/g, ''))
  if (!isNaN(numeric)) {
    return {
      amount: `$${numeric.toLocaleString()}`,
      type
    }
  }

  return { amount: budget, type }
}

export function mapApiProjectToProjectMatch(project: ApiProject): ProjectMatch {
  const { amount, type } = parseBudgetType(project.budget)
  return {
    id: project.id,
    title: project.title,
    matchPct: Math.round(project.match_score),
    budget: amount,
    budgetType: type,
    client: project.platform_name || 'Unknown client',
    postedTime: relativePostedTime(project.posted_date),
    location: 'Remote',  // project listings often don't specify; default to Remote
    description: project.description,
    tags: project.required_skills.slice(0, 4),
    sourceUrl: project.source_url,
    platform: project.platform_name,
    deadline: project.deadline,
  }
}

/** Map an API proposal status string to the UI-facing label. */
function mapProposalStatus(
  status: ApiProposal['status'],
): Proposal['status'] {
  switch (status) {
    case 'accepted': return 'Accepted'
    case 'rejected': return 'Rejected'
    case 'in_review': return 'In Review'
    default: return 'Sent'
  }
}

/** Map a freshly-created ApiProposal (from opportunitiesApi) to the frontend Proposal shape. */
export function mapApiProposalToProposal(p: ApiProposal): Proposal {
  const title =
    p.job_details?.title ??
    p.project_details?.title ??
    `Proposal #${p.id}`
  const client =
    p.job_details?.company ??
    p.project_details?.platform_name ??
    'Unknown'
  return {
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    title,
    status: mapProposalStatus(p.status),
    client,
  }
}

/**
 * Map a DocApiProposal (from /api/documents/proposals/) to the
 * frontend Proposal shape. The field structure is identical to ApiProposal
 * but comes from the documents namespace endpoint.
 */
export function mapDocProposalToProposal(p: DocApiProposal): Proposal {
  const title =
    p.job_details?.title ??
    p.project_details?.title ??
    `Proposal #${p.id}`
  const client =
    p.job_details?.company ??
    p.project_details?.platform_name ??
    'Unknown'
  return {
    id: p.id,
    date: new Date(p.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    title,
    // DocProposalStatus and ProposalStatus share the same values
    status: mapProposalStatus(p.status as ApiProposal['status']),
    client,
  }
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getProjectMatches(): Promise<ProjectMatch[]> {
  const raw = await fetchProjects()
  return raw.map(mapApiProjectToProjectMatch)
}

/**
 * Fetch proposals from GET /api/documents/proposals/.
 * The documents endpoint returns richer data (job_details, project_details)
 * that we map down to the lightweight frontend Proposal shape.
 */
export async function getProposals(): Promise<Proposal[]> {
  const raw = await fetchDocumentProposals()
  return raw.map(mapDocProposalToProposal)
}

/**
 * Fetch a single proposal by id from GET /api/documents/proposals/{id}/.
 * Returns the lightweight frontend Proposal shape.
 */
export async function getProposalById(id: number): Promise<Proposal> {
  const raw = await fetchDocumentProposalById(id)
  return mapDocProposalToProposal(raw)
}

/**
 * Partially update a proposal's status via PATCH /api/documents/proposals/{id}/.
 * Only the changed fields need to be provided.
 */
export async function updateProposalStatus(
  id: number,
  payload: PatchProposalPayload,
): Promise<Proposal> {
  const raw = await patchDocumentProposal(id, payload)
  return mapDocProposalToProposal(raw)
}

/** Create a new proposal for the given job or project. */
export async function submitProposal(
  payload: CreateProposalPayload,
): Promise<Proposal> {
  const created = await apiCreateProposal(payload)
  return mapApiProposalToProposal(created)
}

// Re-export payload types for use in slices / pages
export type { CreateProposalPayload, PatchProposalPayload, DocProposalStatus }
