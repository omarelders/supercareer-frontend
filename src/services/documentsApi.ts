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
import type { CVData } from '@/features/cv-builder/types'

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
// CV API
// ---------------------------------------------------------------------------

export interface DbExperience {
  is_current: boolean
  job_title: string
  company: string
  start_date: string
  end_date: string
  description: string
}

export interface DbEducation {
  school: string
  degree: string
  graduation_year: string
  description: string
}

export interface DbCV {
  id: number
  user: number
  job: number | null
  full_name: string
  phone_number: string
  professional_title: string
  email_address: string
  location: string
  portfolio_url: string
  professional_summary: string
  content: string
  ats_score: number
  is_base: boolean
  Experience: DbExperience[]
  Education: DbEducation[]
  Skills: string[]
  created_at: string
}

/** Mapping function from database CV shape to frontend CVData shape. */
export function dbCvToCvData(dbCv: DbCV): CVData {
  // If the backend has stored the full JSON in the `content` field, prefer it to bypass nested serializer limitations.
  if (dbCv.content && dbCv.content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(dbCv.content);
      if (parsed && parsed.personal && parsed.experience) {
        return parsed as CVData;
      }
    } catch (e) {
      console.warn("Failed to parse dbCv.content as JSON", e);
    }
  }

  return {
    personal: {
      fullName: dbCv.full_name || '',
      title: dbCv.professional_title || '',
      email: dbCv.email_address || '',
      phone: dbCv.phone_number || '',
      location: dbCv.location || '',
      url: dbCv.portfolio_url || '',
      summary: dbCv.professional_summary || '',
    },
    experience: (dbCv.Experience || []).map((exp, idx) => ({
      id: String(idx + 1),
      title: exp.job_title || '',
      company: exp.company || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date || '',
      current: exp.is_current || false,
      description: exp.description || '',
    })),
    education: (dbCv.Education || []).map((edu, idx) => ({
      id: String(idx + 1),
      school: edu.school || '',
      degree: edu.degree || '',
      year: edu.graduation_year || '',
      description: edu.description || '',
    })),
    skills: dbCv.Skills || [],
  }
}

/**
 * Mapping function from frontend CVData shape to database CV shape for saving.
 *
 * NOTE: We intentionally omit the nested Experience / Education / Skills arrays
 * from the PATCH payload because Django REST Framework's nested serializers
 * apply strict validation (e.g. required fields) that causes 400 errors even
 * for valid-looking data. The full CVData is already serialised into the
 * `content` text field as JSON, which is what we read back on load, so the
 * nested arrays are redundant for persistence purposes.
 */
export function cvDataToDbCv(data: CVData): Partial<DbCV> {
  return {
    full_name: data.personal.fullName,
    professional_title: data.personal.title,
    email_address: data.personal.email,
    phone_number: data.personal.phone,
    location: data.personal.location,
    portfolio_url: data.personal.url,
    professional_summary: data.personal.summary,
    // Serialise the entire CVData blob so it survives a page refresh
    // without depending on the nested-array serialisers.
    content: JSON.stringify(data),
  }
}

/** Retrieve all custom CVs from the backend. */
export async function getCustomCVs(): Promise<DbCV[]> {
  const { data } = await api.get<DbCV[]>('/api/documents/cv/')
  console.log("RAW API RESPONSE FROM BACKEND (/api/documents/cv/):", data)
  return data
}

/** Retrieve a specific CV by ID. */
export async function getCvDocumentById(id: number): Promise<DbCV> {
  const { data } = await api.get<DbCV>(`/api/documents/cv/${id}/`)
  return data
}

/** Persist a built CV to the backend (regular CV). */
export async function createCvDocument(
  payload: Partial<DbCV>,
): Promise<DbCV> {
  const { data } = await api.post<DbCV>(
    '/api/documents/cv/',
    payload,
  )
  return data
}

/** Update a specific CV by ID. */
export async function updateCvDocument(
  id: number,
  payload: Partial<DbCV>,
): Promise<DbCV> {
  const { data } = await api.put<DbCV>(
    `/api/documents/cv/${id}/`,
    payload,
  )
  return data
}

/** Partially update a specific CV (e.g. for setting base status or renaming). */
export async function patchCvDocument(
  id: number,
  payload: Partial<DbCV>,
): Promise<DbCV> {
  const { data } = await api.patch<DbCV>(
    `/api/documents/cv/${id}/`,
    payload,
  )
  return data
}

/** Delete a specific CV. */
export async function deleteCustomCV(id: number): Promise<void> {
  await api.delete(`/api/documents/cv/${id}/`)
}

/** Mark a specific CV as Base CV. */
export async function updateCustomCVBase(id: number): Promise<DbCV[]> {
  await patchCvDocument(id, { is_base: true })
  return getCustomCVs()
}

/** Rename a specific CV's title. */
export async function renameCustomCV(id: number, newTitle: string): Promise<DbCV[]> {
  await patchCvDocument(id, { professional_title: newTitle })
  return getCustomCVs()
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
