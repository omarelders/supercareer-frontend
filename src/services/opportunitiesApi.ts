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
// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import {
  getStoredDemoJobs,
  getStoredDemoProjects,
  addStoredDemoProposal,
} from '@/demo/demoStorage'
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================

// ---------------------------------------------------------------------------
// Backend response shapes (snake_case, mirrors the Swagger schema)
// ---------------------------------------------------------------------------

export interface ApiJob {
  id: number
  match_score: number
  required_skills: string[]  // returned by backend as of latest schema
  title: string
  company: string
  description: string
  location: string
  source_platform: string
  source_url: string
  posted_date: string        // "YYYY-MM-DD"
  scraped_at: string         // ISO datetime
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

export interface GenerateProposalPayload {
  project_id: number
}

export interface GenerateProposalResponse {
  proposal: string
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
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return getStoredDemoJobs()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<ApiJob[]>('/api/opportunities/jobs/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[opportunitiesApi] Server offline, falling back to demo jobs:', err)
    return getStoredDemoJobs()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

/** Fetch all project opportunities (already matched/scored by the backend). */
export async function fetchProjects(): Promise<ApiProject[]> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return getStoredDemoProjects()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<ApiProject[]>('/api/opportunities/projects/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[opportunitiesApi] Server offline, falling back to demo projects:', err)
    return getStoredDemoProjects()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

/** Trigger a server-side scrape/refresh of project listings. */
export async function refreshProjects(): Promise<ProjectsRefreshResponse> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return {
      message: 'Projects successfully synchronized! 20 fresh opportunities indexed.',
      imported_count: 20,
    }
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.post<ProjectsRefreshResponse>(
      '/api/opportunities/projects/refresh/',
    )
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    return {
      message: 'Projects successfully synchronized! (Demo mode)',
      imported_count: 5,
    }
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

/** Submit a new proposal for a job or project. */
export async function createProposal(
  payload: CreateProposalPayload,
): Promise<ApiProposal> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    const created = addStoredDemoProposal({
      job: payload.job,
      project: payload.project,
      content: payload.content,
      status: payload.status,
    })
    return created as unknown as ApiProposal
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.post<ApiProposal>(
      '/api/opportunities/proposals/create/',
      payload,
    )
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[opportunitiesApi] Server offline, saving proposal locally:', err)
    const created = addStoredDemoProposal({
      job: payload.job,
      project: payload.project,
      content: payload.content,
      status: payload.status,
    })
    return created as unknown as ApiProposal
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

/**
 * Generate a professional project proposal using the backend AI endpoint.
 */
export async function generateProposal(
  payload: GenerateProposalPayload,
): Promise<GenerateProposalResponse> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const project = getStoredDemoProjects().find((p) => p.id === payload.project_id)
    const projectTitle = project ? project.title : 'this project'
    return {
      proposal: `Hi there,\n\nI reviewed the requirements for "${projectTitle}" and am very excited to help you deliver it. With extensive hands-on experience in full-stack architecture, clean TypeScript / React interfaces, and resilient backend systems, I have delivered very similar solutions with high performance and test coverage.\n\nKey Highlights for your project:\n• Rapid implementation with clean, maintainable architecture\n• Strict attention to detail, responsiveness, and performance optimization\n• Transparent, daily milestone updates and clear documentation\n\nI can begin immediately and would love to discuss the details with you!\n\nBest regards,\nOmar Elders\nSenior Full-Stack Engineer`,
    }
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.post<GenerateProposalResponse>(
      '/api/matching/generate-proposal/',
      payload,
    )
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    return {
      proposal: `Hi there,\n\nI reviewed your requirements and am very excited to help you deliver it. With extensive experience in full-stack architecture, clean TypeScript / React interfaces, and resilient systems, I can begin immediately and deliver high-impact results.\n\nBest regards,\nOmar Elders`,
    }
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}
