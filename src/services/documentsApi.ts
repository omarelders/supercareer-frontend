/**
 * documentsApi.ts
 *
 * Real backend API integration for the /api/documents/ namespace:
 *   POST  /api/documents/cv/create/          – persist a generated CV
 *   GET   /api/documents/proposals/           – list all user proposals
 *   GET   /api/documents/proposals/{id}/      – fetch a single proposal
 *   PUT   /api/documents/proposals/{id}/      – full update of a proposal
 *   PATCH /api/documents/proposals/{id}/      – partial update of a proposal
 *
 * All requests use the shared authenticated Axios instance so JWT tokens
 * are automatically attached and silently refreshed on 401.
 */
import api from './api'

// ---------------------------------------------------------------------------
// Backend response shapes (snake_case, mirrors the Swagger schema)
// ---------------------------------------------------------------------------

/** Raw job shape as embedded inside a document proposal response. */
export interface DocApiJob {
  id: number
  match_score: number
  title: string
  company: string
  description: string
  location: string
  source_platform: string
  source_url: string
  posted_date: string    // "YYYY-MM-DD"
  scraped_at: string     // ISO datetime
}

/** Raw project shape as embedded inside a document proposal response. */
export interface DocApiProject {
  id: number
  title: string
  description: string
  budget: string
  deadline: string       // "YYYY-MM-DD"
  duration: string
  status: string
  required_skills: string[]
  platform_name: string
  source_url: string
  posted_date: string    // ISO datetime
  scraped_at: string     // ISO datetime
  match_score: number
}

export type DocProposalStatus = 'sent' | 'draft' | 'accepted' | 'rejected' | 'in_review'

/** Full proposal shape returned by GET /api/documents/proposals/ */
export interface DocApiProposal {
  id: number
  user: number
  job: number | null
  project: number | null
  content: string
  status: DocProposalStatus
  created_at: string
  job_details: DocApiJob | null
  project_details: DocApiProject | null
}

// ---------------------------------------------------------------------------
// CV document types
// ---------------------------------------------------------------------------

/** Payload for POST /api/documents/cv/create/ */
export interface CreateCvPayload {
  /** Serialised CV content (plain text, JSON, or Markdown). */
  content: string
  /** ATS score computed locally (0-100). */
  ats_score: number
  /** Owning user id – backend will also derive this from the JWT. */
  user: number
  /** Optional job id the CV was tailored for. */
  job?: number | null
}

/** Response from POST /api/documents/cv/create/ */
export interface ApiCvDocument {
  id: number
  content: string
  ats_score: number
  created_at: string
  user: number
  job: number | null
}

// ---------------------------------------------------------------------------
// Proposal update types
// ---------------------------------------------------------------------------

/** Payload for PUT /api/documents/proposals/{id}/ (full replace). */
export interface UpdateProposalPayload {
  job?: number | null
  project?: number | null
  content: string
  status: DocProposalStatus
}

/** Payload for PATCH /api/documents/proposals/{id}/ (partial update). */
export type PatchProposalPayload = Partial<UpdateProposalPayload>

// ---------------------------------------------------------------------------
// CV API
// ---------------------------------------------------------------------------

/**
 * Persist a built CV to the backend.
 *
 * The backend derives the user from the JWT, so `user` is technically
 * redundant but required by the current schema.
 */
export async function createCvDocument(
  payload: CreateCvPayload,
): Promise<ApiCvDocument> {
  const { data } = await api.post<ApiCvDocument>(
    '/api/documents/cv/create/',
    payload,
  )
  return data
}

// ---------------------------------------------------------------------------
// Proposals API
// ---------------------------------------------------------------------------

/** Fetch the complete list of proposals for the authenticated user. */
export async function fetchDocumentProposals(): Promise<DocApiProposal[]> {
  const { data } = await api.get<DocApiProposal[]>('/api/documents/proposals/')
  return data
}

/** Fetch a single proposal by id. */
export async function fetchDocumentProposalById(
  id: number,
): Promise<DocApiProposal> {
  const { data } = await api.get<DocApiProposal>(
    `/api/documents/proposals/${id}/`,
  )
  return data
}

/**
 * Fully replace a proposal (PUT).
 * All writable fields must be provided.
 */
export async function updateDocumentProposal(
  id: number,
  payload: UpdateProposalPayload,
): Promise<DocApiProposal> {
  const { data } = await api.put<DocApiProposal>(
    `/api/documents/proposals/${id}/`,
    payload,
  )
  return data
}

/**
 * Partially update a proposal (PATCH).
 * Only the fields you want to change need to be included.
 */
export async function patchDocumentProposal(
  id: number,
  payload: PatchProposalPayload,
): Promise<DocApiProposal> {
  const { data } = await api.patch<DocApiProposal>(
    `/api/documents/proposals/${id}/`,
    payload,
  )
  return data
}
