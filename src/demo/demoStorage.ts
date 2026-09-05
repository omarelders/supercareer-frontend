// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
// DEMO LOCAL STORAGE PERSISTENCE MANAGER
//
// Allows interactive client actions (creating proposals, saving CV drafts,
// updating profile) to persist across browser refreshes during the demo.
// ============================================================================

import {
  DEMO_JOBS,
  DEMO_PROJECTS,
  DEMO_PROPOSALS,
  DEMO_CUSTOM_CVS,
  DEMO_BASE_CV_DATA,
  DEMO_USER,
  DEMO_ADMIN_USERS,
  DEMO_ADMIN_STATS,
} from './demoData'
import type { DbCV, DocApiProposal, DocProposalStatus } from '@/services/documentsApi'
import type { ApiProject, ApiJob } from '@/services/opportunitiesApi'
import type { AdminUser, AdminStats } from '@/services/adminApi'
import type { CVData } from '@/features/cv-builder/types'
import type { AuthUser } from '@/store/slices/authSlice'

const KEY_CUSTOM_CVS = 'demo_custom_cvs'
const KEY_PROPOSALS = 'demo_proposals'
const KEY_BASE_CV = 'demo_base_cv_data'
const KEY_USER_PROFILE = 'demo_user_profile'
const KEY_PROJECTS = 'demo_projects'
const KEY_JOBS = 'demo_jobs'
const KEY_ADMIN_USERS = 'demo_admin_users'
const KEY_ADMIN_STATS = 'demo_admin_stats'

// ── CVs ──────────────────────────────────────────────────────────────────────

export function getStoredDemoCVs(): DbCV[] {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM_CVS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_CUSTOM_CVS
}

export function saveStoredDemoCVs(cvs: DbCV[]): void {
  try {
    localStorage.setItem(KEY_CUSTOM_CVS, JSON.stringify(cvs))
  } catch {
    // ignore
  }
}

export function addStoredDemoCV(newCv: DbCV): DbCV {
  const current = getStoredDemoCVs()
  const updated = [newCv, ...current]
  saveStoredDemoCVs(updated)
  return newCv
}

export function updateStoredDemoCV(id: number, partial: Partial<DbCV>): DbCV | undefined {
  const current = getStoredDemoCVs()
  let updatedRecord: DbCV | undefined
  const updated = current.map((cv) => {
    if (cv.id === id) {
      updatedRecord = { ...cv, ...partial }
      return updatedRecord
    }
    return cv
  })
  saveStoredDemoCVs(updated)
  return updatedRecord
}

export function deleteStoredDemoCV(id: number): void {
  const current = getStoredDemoCVs()
  saveStoredDemoCVs(current.filter((cv) => cv.id !== id))
}

// ── Base CV ──────────────────────────────────────────────────────────────────

export function getStoredDemoBaseCv(): CVData {
  try {
    const raw = localStorage.getItem(KEY_BASE_CV)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_BASE_CV_DATA
}

export function saveStoredDemoBaseCv(data: CVData): void {
  try {
    localStorage.setItem(KEY_BASE_CV, JSON.stringify(data))
  } catch {
    // ignore
  }
}

// ── Proposals ────────────────────────────────────────────────────────────────

export function getStoredDemoProposals(): DocApiProposal[] {
  try {
    const raw = localStorage.getItem(KEY_PROPOSALS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_PROPOSALS
}

export function saveStoredDemoProposals(proposals: DocApiProposal[]): void {
  try {
    localStorage.setItem(KEY_PROPOSALS, JSON.stringify(proposals))
  } catch {
    // ignore
  }
}

export function addStoredDemoProposal(params: {
  job?: number | null
  project?: number | null
  content: string
  status?: DocProposalStatus
}): DocApiProposal {
  const current = getStoredDemoProposals()
  const nextId = Math.max(...current.map((p) => p.id), 10) + 1

  const matchingProject = params.project
    ? getStoredDemoProjects().find((p) => p.id === params.project)
    : null

  const matchingJob = params.job
    ? getStoredDemoJobs().find((j) => j.id === params.job)
    : null

  const newProp: DocApiProposal = {
    id: nextId,
    user: 1,
    job: params.job ?? null,
    project: params.project ?? null,
    content: params.content,
    status: params.status || 'sent',
    created_at: new Date().toISOString(),
    job_details: matchingJob
      ? {
          id: matchingJob.id,
          match_score: matchingJob.match_score,
          title: matchingJob.title,
          company: matchingJob.company,
          description: matchingJob.description,
          location: matchingJob.location,
          source_platform: matchingJob.source_platform,
          source_url: matchingJob.source_url,
          posted_date: matchingJob.posted_date,
          scraped_at: matchingJob.scraped_at,
        }
      : null,
    project_details: matchingProject
      ? {
          id: matchingProject.id,
          title: matchingProject.title,
          description: matchingProject.description,
          budget: matchingProject.budget,
          deadline: matchingProject.deadline,
          duration: matchingProject.duration,
          status: matchingProject.status,
          required_skills: matchingProject.required_skills,
          platform_name: matchingProject.platform_name,
          source_url: matchingProject.source_url,
          posted_date: matchingProject.posted_date,
          scraped_at: matchingProject.scraped_at,
          match_score: matchingProject.match_score,
        }
      : null,
  }

  saveStoredDemoProposals([newProp, ...current])
  return newProp
}

export function updateStoredDemoProposalStatus(
  id: number,
  status: DocProposalStatus,
): DocApiProposal | undefined {
  const current = getStoredDemoProposals()
  let updatedItem: DocApiProposal | undefined
  const updated = current.map((p) => {
    if (p.id === id) {
      updatedItem = { ...p, status }
      return updatedItem
    }
    return p
  })
  saveStoredDemoProposals(updated)
  return updatedItem
}

// ── Projects ─────────────────────────────────────────────────────────────────

export function getStoredDemoProjects(): ApiProject[] {
  try {
    const raw = localStorage.getItem(KEY_PROJECTS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_PROJECTS
}

export function saveStoredDemoProjects(projects: ApiProject[]): void {
  try {
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(projects))
  } catch {
    // ignore
  }
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export function getStoredDemoJobs(): ApiJob[] {
  try {
    const raw = localStorage.getItem(KEY_JOBS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_JOBS
}

export function saveStoredDemoJobs(jobs: ApiJob[]): void {
  try {
    localStorage.setItem(KEY_JOBS, JSON.stringify(jobs))
  } catch {
    // ignore
  }
}

// ── User Profile ─────────────────────────────────────────────────────────────

export function getStoredDemoUser(): AuthUser {
  try {
    const raw = localStorage.getItem(KEY_USER_PROFILE)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_USER
}

export function saveStoredDemoUser(user: AuthUser): void {
  try {
    localStorage.setItem(KEY_USER_PROFILE, JSON.stringify(user))
  } catch {
    // ignore
  }
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function getStoredDemoAdminUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(KEY_ADMIN_USERS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_ADMIN_USERS
}

export function toggleStoredDemoUserBlock(id: number): AdminUser {
  const users = getStoredDemoAdminUsers()
  const target = users.find((u) => u.id === id)
  if (target) {
    target.role = target.role.includes('blocked')
      ? target.role.replace('_blocked', '')
      : `${target.role}_blocked`
    localStorage.setItem(KEY_ADMIN_USERS, JSON.stringify(users))
    return target
  }
  return {
    id,
    username: 'user',
    email: 'user@example.com',
    first_name: 'Demo',
    last_name: 'User',
    role: 'job_seeker',
  }
}

export function getStoredDemoAdminStats(): AdminStats {
  try {
    const raw = localStorage.getItem(KEY_ADMIN_STATS)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_ADMIN_STATS
}

// ============================================================================
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================
