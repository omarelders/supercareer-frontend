/**
 * documentsApi.ts
 *
 * Real backend API integration for the /api/documents/ namespace.
 *
 * CV Endpoints:
 *   GET    /api/documents/cv/               – list all user CVs (returns DbCV[])
 *   POST   /api/documents/cv/               – create a new tailored CV (accepts ApiCV)
 *   GET    /api/documents/cv/{id}/          – fetch a specific CV (returns DbCV)
 *   PUT    /api/documents/cv/{id}/          – fully replace CV content (accepts ApiCV)
 *   PATCH  /api/documents/cv/{id}/          – partially update CV content (accepts ApiCV or flat fields)
 *   DELETE /api/documents/cv/{id}/          – delete a specific CV
 *
 *   GET    /api/documents/cv/base/update/   – retrieve the Base CV
 *   PUT    /api/documents/cv/base/update/   – update the Base CV (accepts ApiCV)
 *   PATCH  /api/documents/cv/base/update/   – partially update the Base CV
 *   POST   /api/documents/cv/base/          – create the Base CV (accepts ApiCV)
 *
 *   POST   /api/documents/cv/job/{job_id}/  – generate an AI-tailored CV for a job
 *
 * Proposal Endpoints:
 *   GET    /api/documents/proposals/        – list all user proposals
 *   GET    /api/documents/proposals/{id}/   – fetch a single proposal
 *   PUT    /api/documents/proposals/{id}/   – full update of a proposal
 *   PATCH  /api/documents/proposals/{id}/   – partial update of a proposal
 *   DELETE /api/documents/proposals/{id}/   – delete a proposal
 *
 * All requests use the shared authenticated Axios instance so JWT tokens
 * are automatically attached and silently refreshed on 401.
 */
import api from './api'
import type { CVData } from '@/features/cv-builder/types'
import { cvDataToApiFormat, apiFormatToCvData, type ApiCV, type ApiPersonalDetails } from './cvAiApi'

// ---------------------------------------------------------------------------
// Backend response shapes (snake_case, mirrors the Swagger CV schema)
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
// CV API — Database shape (returned from GET endpoints)
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

/** Shape returned by GET /api/documents/cv/ and GET /api/documents/cv/{id}/ */
export interface DbCV {
  id: number
  user: number
  job: number | null
  // Flat model fields (populated on some backends)
  full_name: string
  phone_number: string
  professional_title: string
  email_address: string
  location: string
  portfolio_url: string
  professional_summary: string
  // content: raw JSON string or object (CVData or ApiCV format)
  content: string
  ats_score: number
  is_base: boolean
  // Relational array fields
  Experience: DbExperience[]
  Education: DbEducation[]
  Skills: string[]
  created_at: string
  // Top-level ApiCV fields — the backend sometimes returns the CV in this format
  // directly rather than populating the flat fields above.
  'Personal Details'?: {
    'Full Name'?: string
    'Phone Number'?: string
    'Professional Title'?: string
    'Email Address'?: string
    'Location'?: string
    'Portfolio / LinkedIn URL'?: string
    'Professional Summary'?: string
  }
}

// ---------------------------------------------------------------------------
// Mapping: DbCV (GET response) → CVData (frontend state)
// ---------------------------------------------------------------------------

/**
 * Convert a database CV shape into the frontend CVData shape.
 *
 * Priority order:
 *   0. Top-level `Personal Details` key (ApiCV stored directly on the record)
 *   1. `content` field contains CVData JSON (from our flat-field saves)
 *   2. `content` field contains ApiCV JSON (from backend AI-tailoring)
 *   3. Flat model fields (full_name, professional_title, Experience, etc.)
 */
export function dbCvToCvData(dbCv: DbCV): CVData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = dbCv as any

  // ── Case 0: Backend returned ApiCV format at the top level ─────────────────
  // The backend stores the CV as { 'Personal Details': {...}, 'Experience': [...], ... }
  // directly on the record instead of using the flat snake_case fields.
  if (raw['Personal Details'] && typeof raw['Personal Details'] === 'object') {
    const pd = raw['Personal Details']
    return {
      personal: {
        fullName: pd['Full Name'] || '',
        title: pd['Professional Title'] || '',
        email: pd['Email Address'] || '',
        phone: pd['Phone Number'] || '',
        location: pd['Location'] || '',
        url: pd['Portfolio / LinkedIn URL'] || '',
        summary: pd['Professional Summary'] || '',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      experience: (raw['Experience'] || []).map((exp: any, idx: number) => ({
        id: String(idx + 1),
        title: exp['Job Title'] || exp.job_title || '',
        company: exp['Company'] || exp.company || '',
        startDate: exp['Start Date'] || exp.start_date || '',
        endDate: exp['End Date'] || exp.end_date || '',
        current: exp['I currently work here'] ?? exp.is_current ?? false,
        description: exp['Description'] || exp.description || '',
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      education: (raw['Education'] || []).map((edu: any, idx: number) => ({
        id: String(idx + 1),
        school: edu['School / University'] || edu.school || '',
        degree: edu['Degree / Qualification'] || edu.degree || '',
        year: edu['Year of Graduation'] || edu.graduation_year || '',
        description: edu['Additional Details'] || edu.description || '',
      })),
      skills: raw['Skills'] || [],
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null;

  if (dbCv.content) {
    if (typeof dbCv.content === 'object') {
      parsed = dbCv.content;
    } else if (typeof dbCv.content === 'string') {
      const trimmed = dbCv.content.trim();
      if (trimmed.startsWith('{')) {
        try {
          parsed = JSON.parse(trimmed);
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed); // Handle double-encoded JSON
          }
        } catch (e) {
          console.warn('[dbCvToCvData] Failed to parse content as JSON:', e);
        }
      }
    }
  }

  if (parsed) {
    // Case 1: our own CVData JSON (has at least `personal` key)
    if (parsed.personal) {
      return {
        personal: {
          fullName: parsed.personal.fullName || '',
          title: parsed.personal.title || '',
          email: parsed.personal.email || '',
          phone: parsed.personal.phone || '',
          location: parsed.personal.location || '',
          url: parsed.personal.url || '',
          summary: parsed.personal.summary || '',
        },
        experience: parsed.experience || [],
        education: parsed.education || [],
        skills: parsed.skills || [],
      };
    }

    // Case 2: ApiCV format from backend AI tailoring (has 'Personal Details' key)
    if (parsed['Personal Details']) {
      return apiFormatToCvData(parsed as ApiCV);
    }
  }

  // Case 3: Flat model fields fallback
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

// ---------------------------------------------------------------------------
// Custom CV CRUD  (/api/documents/cv/)
// ---------------------------------------------------------------------------

/** Retrieve all CVs (base + tailored) for the authenticated user. */
export async function getCustomCVs(): Promise<DbCV[]> {
  const { data } = await api.get<DbCV[]>('/api/documents/cv/')
  return data
}

/** Retrieve a specific CV by ID. */
export async function getCvDocumentById(id: number): Promise<DbCV> {
  const { data } = await api.get<DbCV>(`/api/documents/cv/${id}/`)
  return data
}

/**
 * Create a new regular (non-base) CV.
 * Explicitly sets is_base: false to prevent the backend from
 * auto-marking it as the user's Base CV.
 */
export async function createCvDocument(cvData: CVData): Promise<DbCV> {
  const payload = {
    ...buildFlatCvPayload(cvData),
    is_base: false, // Enforce: regular CVs are never the Base CV
  }
  const { data } = await api.post<DbCV>('/api/documents/cv/', payload)
  return data
}

/**
 * Fully replace a CV's content (PUT).
 * Payload must use the CustomCVSchema (ApiCV) format.
 */
export async function updateCvDocument(id: number, payload: ApiCV): Promise<DbCV> {
  const { data } = await api.put<DbCV>(`/api/documents/cv/${id}/`, payload)
  return data
}

/**
 * Save CV content back to the backend.
 *
 * The write endpoints use CustomCVSchema / PatchedCustomCVSchema which
 * expects the ApiCV string-key format ("Personal Details", "Job Title", etc.)
 * NOT the flat snake_case fields returned by the GET endpoint.
 *
 * We use PATCH (PatchedCustomCVSchema) because it has no required fields,
 * so missing/empty values like portfolio_url won't cause 400 errors.
 */
export async function patchCvContent(id: number, cvData: CVData): Promise<DbCV> {
  const apiPayload = cvDataToApiFormat(cvData)

  if (!cvData.personal.url) {
    delete (apiPayload['Personal Details'] as Partial<ApiPersonalDetails>)['Portfolio / LinkedIn URL']
  }

  try {
    await api.patch<DbCV>(`/api/documents/cv/${id}/`, apiPayload)

    // ── DEFINITIVE BACKEND TEST ──────────────────────────────────────────────
    const { data: getResponse } = await api.get<DbCV>(`/api/documents/cv/${id}/`)

    const patchedName = apiPayload['Personal Details']['Full Name']
    const fetchedName = getResponse.full_name
    const saved = fetchedName === patchedName

    if (!saved) {
      console.warn(`[patchCvContent] Backend save mismatch — sent: "${patchedName}", got back: "${fetchedName}"`)
    }

    return getResponse
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axErr = err as { response?: { data?: unknown; status?: number } }
      console.error('[patchCvContent] Error response body:', JSON.stringify(axErr.response?.data, null, 2))
    }
    throw err
  }
}

/**
 * Build the flat DbCV-compatible payload from CVData.
 * Stores full CVData JSON in `content` for round-trip fidelity.
 * Exported so other modules (e.g. cvDocumentSlice) can reuse it.
 */
export function buildFlatCvPayload(cvData: CVData): Partial<DbCV> {
  return {
    content: JSON.stringify(cvData),
    full_name: cvData.personal.fullName || '',
    professional_title: cvData.personal.title || '',
    email_address: cvData.personal.email || '',
    phone_number: cvData.personal.phone || '',
    location: cvData.personal.location || '',
    portfolio_url: cvData.personal.url || '',
    professional_summary: cvData.personal.summary || '',
    Experience: (cvData.experience || [])
      .filter((exp) => exp.title?.trim() || exp.company?.trim() || exp.startDate?.trim() || exp.endDate?.trim() || exp.description?.trim())
      .map(exp => ({
        job_title: exp.title,
        company: exp.company,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.current,
        description: exp.description,
      })),
    Education: (cvData.education || [])
      .filter((edu) => edu.school?.trim() || edu.degree?.trim() || edu.year?.trim() || edu.description?.trim())
      .map(edu => ({
        school: edu.school,
        degree: edu.degree,
        graduation_year: edu.year,
        description: edu.description,
      })),
    Skills: cvData.skills,
  }
}

/**
 * Partially update a CV's metadata fields (PATCH with flat fields).
 * Use this for simple flag/title changes like is_base, professional_title.
 */
export async function patchCvDocument(
  id: number,
  payload: Partial<DbCV>,
): Promise<DbCV> {
  const { data } = await api.patch<DbCV>(`/api/documents/cv/${id}/`, payload)
  return data
}

/** Delete a specific CV. */
export async function deleteCustomCV(id: number): Promise<void> {
  await api.delete(`/api/documents/cv/${id}/`)
}

/**
 * Mark a specific CV as the Base CV.
 * Enforces the singleton constraint:
 *   1. Fetches all CVs to find any currently marked as base.
 *   2. Clears is_base on all of them.
 *   3. Sets is_base: true on the target.
 *
 * This is defensive — the backend should also enforce this,
 * but we guard on the frontend in case it doesn't.
 */
export async function updateCustomCVBase(id: number): Promise<DbCV[]> {
  const all = await getCustomCVs()
  // Clear is_base on every CV that is currently the base (except the target)
  const clearPromises = all
    .filter((cv) => cv.is_base && cv.id !== id)
    .map((cv) => patchCvDocument(cv.id, { is_base: false }))
  await Promise.all(clearPromises)
  // Now mark the target as base
  await patchCvDocument(id, { is_base: true })
  return getCustomCVs()
}

/** Rename a CV's professional title. */
export async function renameCustomCV(id: number, newTitle: string): Promise<DbCV[]> {
  await patchCvDocument(id, { professional_title: newTitle })
  return getCustomCVs()
}

// ---------------------------------------------------------------------------
// Base CV operations  (/api/documents/cv/base/ and /api/documents/cv/base/update/)
// ---------------------------------------------------------------------------

/** Retrieve the user's Base CV. Throws if no base CV exists (404). */
export async function getBaseCv(): Promise<DbCV> {
  const { data } = await api.get<DbCV>('/api/documents/cv/base/update/')
  return data
}

/**
 * Create the Base CV (only called when no base CV exists yet).
 * Uses the flat payload + content JSON approach for reliable saves.
 */
export async function createBaseCv(cvData: CVData): Promise<DbCV> {
  // Try the ApiCV format first (POST /cv/base/ uses CustomCVSchema)
  try {
    const payload = cvDataToApiFormat(cvData)
    const { data } = await api.post<DbCV>('/api/documents/cv/base/', payload)
    // After creating, patch with content JSON so GET round-trips correctly
    if (data?.id) {
      await api.patch<DbCV>(`/api/documents/cv/${data.id}/`, buildFlatCvPayload(cvData)).catch(() => {/* non-critical */})
    }
    return data
  } catch {
    // Fallback: POST with flat fields
    const { data } = await api.post<DbCV>('/api/documents/cv/base/', buildFlatCvPayload(cvData))
    return data
  }
}

/**
 * Update the existing Base CV.
 *
 * Uses PATCH /api/documents/cv/base/update/ (PatchedCustomCVSchema).
 * Same ApiCV format as patchCvContent — no required fields so safe.
 */
export async function saveBaseCv(cvData: CVData): Promise<DbCV> {
  const apiPayload = cvDataToApiFormat(cvData)

  // Same URL-stripping as patchCvContent — Django URLValidator rejects placeholders.
  if (!cvData.personal.url) {
    delete (apiPayload['Personal Details'] as Partial<ApiPersonalDetails>)['Portfolio / LinkedIn URL']
  }

  try {
    const { data } = await api.patch<DbCV>('/api/documents/cv/base/update/', apiPayload)
    return data
  } catch (patchErr) {
    console.warn('[saveBaseCv] PATCH failed, trying PUT:', patchErr)
    const { data } = await api.put<DbCV>('/api/documents/cv/base/update/', apiPayload)
    return data
  }
}

// ---------------------------------------------------------------------------
// Job-tailored CV creation  (/api/documents/cv/job/{job_id}/)
// ---------------------------------------------------------------------------

/**
 * Trigger the backend to generate an AI-tailored CV for a specific job.
 *
 * The backend reads the user's Base CV, optimises it for `jobId`, and
 * creates a new CV entry. The endpoint returns no body (200), so we
 * re-fetch the CV list afterward and locate the newly created entry
 * by matching the job foreign key.
 */
export async function createJobTailoredCv(jobId: number): Promise<DbCV> {
  await api.post(`/api/documents/cv/job/${jobId}/`)
  // Re-fetch the full list and find the CV linked to this job
  const cvs = await getCustomCVs()
  const tailored = cvs.find((cv) => cv.job === jobId)
  if (!tailored) {
    throw new Error('Tailored CV was not found after creation. Please refresh the page.')
  }
  return tailored
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

/**
 * Delete a proposal by id.
 */
export async function deleteDocumentProposal(id: number): Promise<void> {
  await api.delete(`/api/documents/proposals/${id}/`)
}
