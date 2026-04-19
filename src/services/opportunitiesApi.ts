/**
 * opportunitiesApi.ts
 *
 * Real backend API integration for:
 *   GET  /api/opportunities/jobs/
 *   GET  /api/opportunities/projects/
 *   POST /api/opportunities/projects/refresh/
 *   POST /api/opportunities/proposals/create/
 *
 * Uses the shared authenticated Axios instance so JWT tokens are
 * automatically attached and refreshed.
 */
import api from './api'

// ---------------------------------------------------------------------------
// Backend response shapes (snake_case, mirrors the Swagger schema)
// ---------------------------------------------------------------------------

export interface ApiJob {
  id: number
  match_score: number
  title: string
  company: string
  description: string
  location: string
  source_platform: string
  source_url: string
  posted_date: string      // "YYYY-MM-DD"
  scraped_at: string       // ISO datetime
}

export interface ApiProject {
  id: number
  title: string
  description: string
  budget: string
  deadline: string         // "YYYY-MM-DD"
  duration: string
  status: string
  required_skills: string[]
  platform_name: string
  source_url: string
  posted_date: string      // ISO datetime
  scraped_at: string       // ISO datetime
  match_score: number
}

export interface ProjectsRefreshResponse {
  message: string
  imported_count: number
}

export type ProposalStatus = 'sent' | 'draft' | 'accepted' | 'rejected' | 'in_review'

export interface CreateProposalPayload {
  /** ID of the job this proposal is for (null-ish if project-only) */
  job?: number | null
  /** ID of the project this proposal is for (null-ish if job-only) */
  project?: number | null
  content: string
  status: ProposalStatus
}

export interface ApiProposal {
  id: number
  user: number
  job: number | null
  project: number | null
  content: string
  status: ProposalStatus
  created_at: string
  job_details: ApiJob | null
  project_details: ApiProject | null
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** Fetch all job opportunities (already matched/scored by the backend). */
export async function fetchJobs(): Promise<ApiJob[]> {
  const { data } = await api.get<ApiJob[]>('/api/opportunities/jobs/')
  return data
}

/** Fetch all project opportunities (already matched/scored by the backend). */
export async function fetchProjects(): Promise<ApiProject[]> {
  const { data } = await api.get<ApiProject[]>('/api/opportunities/projects/')
  return data
}

/** Trigger a server-side scrape/refresh of project listings. */
export async function refreshProjects(): Promise<ProjectsRefreshResponse> {
  const { data } = await api.post<ProjectsRefreshResponse>(
    '/api/opportunities/projects/refresh/',
  )
  return data
}

/** Submit a new proposal for a job or project. */
export async function createProposal(
  payload: CreateProposalPayload,
): Promise<ApiProposal> {
  const { data } = await api.post<ApiProposal>(
    '/api/opportunities/proposals/create/',
    payload,
  )
  return data
}
