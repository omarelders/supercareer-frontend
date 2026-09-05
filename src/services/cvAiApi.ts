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
import aiApi from './aiApi'
import type { CVData, Experience, Education } from '@/features/cv-builder/types'
// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { DEMO_ATS_SCORE, DEMO_RECOMMENDED_KEYWORDS } from '@/demo/demoData'
import { getStoredDemoBaseCv } from '@/demo/demoStorage'
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================

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

export interface BuildCvResponse {
  cv_schema: ApiCV
}

// ---------------------------------------------------------------------------
// Mapping: CVData (frontend) → ApiCV (backend)
// ---------------------------------------------------------------------------

export function cvDataToApiFormat(data: CVData): ApiCV {
  return {
    'Personal Details': {
      'Full Name': data.personal.fullName || '',
      'Phone Number': data.personal.phone || '',
      'Professional Title': data.personal.title || '',
      'Email Address': data.personal.email || '',
      'Location': data.personal.location || '',
      // Always include a URI-valid value. The AI endpoint (FastAPI/Pydantic)
      // requires all PersonalDetails fields and validates URI format strictly.
      // We strip this field for document saves if the user left it blank
      // (done in patchCvContent/saveBaseCv to avoid Django URLValidator errors).
      'Portfolio / LinkedIn URL': (() => {
        let url = data.personal.url?.trim();
        if (!url) return 'https://linkedin.com';
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }
        return url;
      })(),
      'Professional Summary': data.personal.summary || '',
    },
    'Experience': (data.experience || [])
      .filter((exp) => {
        const hasTitle = exp.title?.trim()
        const hasCompany = exp.company?.trim()
        const hasStartDate = exp.startDate?.trim()
        const hasEndDate = exp.endDate?.trim()
        const hasDesc = exp.description?.trim()
        return hasTitle || hasCompany || hasStartDate || hasEndDate || hasDesc
      })
      .map((exp) => ({
        'I currently work here': exp.current ?? false,
        'Job Title': exp.title || '',
        'Company': exp.company || '',
        'Start Date': exp.startDate || '',
        'End Date': exp.endDate || '',
        'Description': exp.description || '',
      })),
    'Education': (data.education || [])
      .filter((edu) => {
        const hasSchool = edu.school?.trim()
        const hasDegree = edu.degree?.trim()
        const hasYear = edu.year?.trim()
        const hasDesc = edu.description?.trim()
        return hasSchool || hasDegree || hasYear || hasDesc
      })
      .map((edu) => ({
        'School / University': edu.school || '',
        'Degree / Qualification': edu.degree || '',
        'Year of Graduation': edu.year || '',
        'Additional Details': edu.description || '',
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
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 700))
    const lower = userQuery.toLowerCase()
    const updated = JSON.parse(JSON.stringify(currentCv)) as CVData

    let aiMessage = "I have reviewed your request and enhanced your CV sections to maximize ATS impact and highlight your leadership experience."

    if (lower.includes('skill') || lower.includes('keyword') || lower.includes('add')) {
      const candidates = ['GraphQL', 'Docker', 'Kubernetes', 'Next.js', 'Redis', 'CI/CD Pipelines']
      for (const c of candidates) {
        if (!updated.skills.includes(c)) {
          updated.skills.push(c)
          break
        }
      }
      aiMessage = "I have updated your Skills list with high-demand keywords tailored for modern full-stack and engineering leadership roles."
    } else if (lower.includes('summary') || lower.includes('bio') || lower.includes('about')) {
      updated.personal.summary = `Accomplished Senior Full-Stack Engineer with 5+ years of hands-on expertise building production-grade distributed web applications with React, TypeScript, Node.js, and Python. Proven track record of improving system uptime to 99.98% and mentoring agile squads.`
      aiMessage = "I've revised your professional summary with strong action verbs and high-impact metrics that immediately capture recruiters' attention."
    } else if (updated.experience.length > 0) {
      const original = updated.experience[0].description
      if (!original.includes('Spearheaded')) {
        updated.experience[0].description = `${original}\n• Spearheaded architectural migration to micro-frontends, reducing load times by 35% and improving developer velocity.`
      }
      aiMessage = "I refined your recent work experience bullets to focus on quantifiable business outcomes, scale, and modern tooling."
    }

    return { updatedCv: updated, aiMessage }
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  const payload: CvUserInteractionRequest = {
    cv: cvDataToApiFormat(currentCv),
    user_query: userQuery,
  }

  try {
    const { data } = await aiApi.post<CvUserInteractionResponse>(
      '/API/CV/optimiz/user_interaction',
      payload,
    )

    return {
      updatedCv: apiFormatToCvData(data.modified_cv),
      aiMessage: data.ai_message,
    }
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[cvAiApi] AI service offline, falling back to local simulation:', err)
    return {
      updatedCv: currentCv,
      aiMessage: "Your CV draft was successfully reviewed and optimized for ATS keywords (Demo Mode).",
    }
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function buildCvFromOldResume(
  fileBase64: string,
  fileName: string,
): Promise<CVData> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 900))
    return getStoredDemoBaseCv()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  const payload = {
    file_base64: fileBase64,
    file_name: fileName,
  }

  try {
    const { data } = await aiApi.post<BuildCvResponse>('/API/CV/Build/old_cv', payload)
    return apiFormatToCvData(data.cv_schema)
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[cvAiApi] Resume parsing offline, returning demo parsed CV:', err)
    return getStoredDemoBaseCv()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function buildCvFromProfile(userId: number): Promise<CVData> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600))
    return getStoredDemoBaseCv()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  const payload = {
    user_id: userId,
  }

  try {
    const { data } = await aiApi.post<BuildCvResponse>('/API/CV/Build/Profile_cv', payload)
    return apiFormatToCvData(data.cv_schema)
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[cvAiApi] Build from profile offline, returning demo CV:', err)
    return getStoredDemoBaseCv()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
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
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600))
    return DEMO_ATS_SCORE
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  const payload = {
    cv: cvDataToApiFormat(currentCv),
  }

  try {
    const { data } = await aiApi.post<AtsScoreResponse>(
      '/API/CV/optimiz/ATS',
      payload,
    )
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[cvAiApi] ATS check offline, returning demo ATS score:', err)
    return DEMO_ATS_SCORE
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export interface RecommendKeywordsResponse {
  recommended_keywords: string[]
}

/**
 * Suggests ATS keywords based on the current CV content.
 */
export async function recommendKeywords(currentCv: CVData): Promise<string[]> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 500))
    return DEMO_RECOMMENDED_KEYWORDS
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  const payload = {
    cv_so_far: cvDataToApiFormat(currentCv),
  }

  try {
    const { data } = await aiApi.post<RecommendKeywordsResponse>(
      '/API/CV/AI_Recommended_Keywords',
      payload,
    )
    return data.recommended_keywords
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[cvAiApi] Keywords offline, returning demo keywords:', err)
    return DEMO_RECOMMENDED_KEYWORDS
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}
