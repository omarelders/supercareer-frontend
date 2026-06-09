/**
 * cvAiApi.ts
 *
 * Integration for the CV AI interaction endpoint:
 *   POST /API/CV/optimiz/user_interaction
 *
 * Handles full bi-directional mapping between the backend API shape
 * (string-keyed objects like "Personal Details", "Experience", etc.)
 * and the frontend CVData shape used by the CV builder components.
 */
import api from './api'
import type { CVData, Experience, Education } from '@/features/cv-builder/types'

// ---------------------------------------------------------------------------
// Backend API shapes  (mirrors Swagger schema exactly)
// ---------------------------------------------------------------------------

export interface ApiPersonalDetails {
  'Full Name': string
  'Phone Number': string
  'Professional Title': string
  'Email Address': string
  'Location': string
  'Portfolio / LinkedIn URL': string
  'Professional Summary': string
}

export interface ApiExperience {
  'I currently work here': boolean
  'Job Title': string
  'Company': string
  'Start Date': string
  'End Date': string
  'Description': string
}

export interface ApiEducation {
  'School / University': string
  'Degree / Qualification': string
  'Year of Graduation': string
  'Additional Details': string
}

export interface ApiCV {
  'Personal Details': ApiPersonalDetails
  'Experience': ApiExperience[]
  'Education': ApiEducation[]
  'Skills': string[]
}

export interface CvUserInteractionRequest {
  cv: ApiCV
  user_query: string
}

export interface CvUserInteractionResponse {
  modified_cv: ApiCV
  ai_message: string
}

// ---------------------------------------------------------------------------
// Mapping: CVData (frontend) → ApiCV (backend)
// ---------------------------------------------------------------------------

export function cvDataToApiFormat(data: CVData): ApiCV {
  return {
    'Personal Details': {
      'Full Name': data.personal.fullName,
      'Phone Number': data.personal.phone,
      'Professional Title': data.personal.title,
      'Email Address': data.personal.email,
      'Location': data.personal.location,
      'Portfolio / LinkedIn URL': data.personal.url,
      'Professional Summary': data.personal.summary,
    },
    'Experience': data.experience.map((exp) => ({
      'I currently work here': exp.current,
      'Job Title': exp.title,
      'Company': exp.company,
      'Start Date': exp.startDate,
      'End Date': exp.endDate,
      'Description': exp.description,
    })),
    'Education': data.education.map((edu) => ({
      'School / University': edu.school,
      'Degree / Qualification': edu.degree,
      'Year of Graduation': edu.year,
      'Additional Details': edu.description,
    })),
    'Skills': data.skills,
  }
}

// ---------------------------------------------------------------------------
// Mapping: ApiCV (backend) → CVData (frontend)
// ---------------------------------------------------------------------------

export function apiFormatToCvData(apiCv: ApiCV): CVData {
  const personal = apiCv['Personal Details']
  const experiences: Experience[] = (apiCv['Experience'] ?? []).map(
    (exp, idx) => ({
      id: String(idx + 1),
      title: exp['Job Title'] ?? '',
      company: exp['Company'] ?? '',
      startDate: exp['Start Date'] ?? '',
      endDate: exp['End Date'] ?? '',
      current: exp['I currently work here'] ?? false,
      description: exp['Description'] ?? '',
    }),
  )
  const educations: Education[] = (apiCv['Education'] ?? []).map(
    (edu, idx) => ({
      id: String(idx + 1),
      school: edu['School / University'] ?? '',
      degree: edu['Degree / Qualification'] ?? '',
      year: edu['Year of Graduation'] ?? '',
      description: edu['Additional Details'] ?? '',
    }),
  )

  return {
    personal: {
      fullName: personal?.['Full Name'] ?? '',
      phone: personal?.['Phone Number'] ?? '',
      title: personal?.['Professional Title'] ?? '',
      email: personal?.['Email Address'] ?? '',
      location: personal?.['Location'] ?? '',
      url: personal?.['Portfolio / LinkedIn URL'] ?? '',
      summary: personal?.['Professional Summary'] ?? '',
    },
    experience: experiences,
    education: educations,
    skills: apiCv['Skills'] ?? [],
  }
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

/**
 * Send the current CV + user query to the AI interaction endpoint.
 * Returns the modified CV (mapped back to CVData) and the AI's message.
 */
export async function cvUserInteraction(
  currentCv: CVData,
  userQuery: string,
): Promise<{ updatedCv: CVData; aiMessage: string }> {
  const payload: CvUserInteractionRequest = {
    cv: cvDataToApiFormat(currentCv),
    user_query: userQuery,
  }

  const { data } = await api.post<CvUserInteractionResponse>(
    '/API/CV/optimiz/user_interaction',
    payload,
  )

  return {
    updatedCv: apiFormatToCvData(data.modified_cv),
    aiMessage: data.ai_message,
  }
}

export interface AtsScoreResponse {
  feedback: string
  ats_score: number
}

/**
 * Analyzes CV for ATS compatibility.
 */
export async function analyzeCvAts(currentCv: CVData): Promise<AtsScoreResponse> {
  const payload = {
    cv: cvDataToApiFormat(currentCv),
  }

  const { data } = await api.post<AtsScoreResponse>(
    '/API/CV/optimiz/ATS',
    payload,
  )

  return data
}

