import { fetchJobs, type ApiJob } from './opportunitiesApi'
import type { CVData } from '@/features/cv-builder/types'
import {
  getCustomCVs,
  deleteCustomCV,
  updateCustomCVBase,
  renameCustomCV,
  getCvDocumentById,
  updateCvDocument,
  patchCvDocument,
  dbCvToCvData,
  cvDataToDbCv,
} from './documentsApi'



export type JobIconName = 'Cloud' | 'Terminal' | 'Share2' | 'Database' | 'BarChart2' | 'Palette'
export type JobLocation = 'Remote' | 'Hybrid' | 'On-site'
export type JobType = 'Contract' | 'Full-time' | 'Part-time'

export interface JobFeature {
  text: string
  type: 'check' | 'info'
}

export interface JobMatch {
  id: number
  title: string
  company: string
  location: JobLocation
  jobType: JobType
  matchPct: number
  iconName: JobIconName
  features: JobFeature[]
}

export interface JobMatchFilters {
  location?: JobLocation
  type?: JobType
  minMatchPct?: number
}

export interface GetJobMatchesParams {
  page?: number
  pageSize?: number
  filters?: JobMatchFilters
}

export interface JobMatchPageResponse {
  items: JobMatch[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface CustomCV {
  id: number
  date: string
  title: string
  appliedTo: string
  base_cv: boolean
}






// Icon heuristic: pick an icon based on the job's source platform or title keywords
const PLATFORM_ICON_MAP: Record<string, JobIconName> = {
  linkedin: 'Share2',
  upwork: 'Cloud',
  toptal: 'Terminal',
  freelancer: 'BarChart2',
  fiverr: 'Palette',
  indeed: 'Database',
  glassdoor: 'BarChart2',
}

function resolveIconName(job: ApiJob): JobIconName {
  const platform = (job.source_platform ?? '').toLowerCase()
  for (const [key, icon] of Object.entries(PLATFORM_ICON_MAP)) {
    if (platform.includes(key)) return icon
  }
  // Fallback: keyword scan of title
  const title = job.title.toLowerCase()
  if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'Palette'
  if (title.includes('data') || title.includes('analyst')) return 'BarChart2'
  if (title.includes('backend') || title.includes('database') || title.includes('db')) return 'Database'
  if (title.includes('devops') || title.includes('cloud') || title.includes('infra')) return 'Cloud'
  if (title.includes('frontend') || title.includes('react') || title.includes('vue')) return 'Terminal'
  return 'Share2'
}

function resolveLocation(raw: string): JobLocation {
  const lower = raw.toLowerCase()
  if (lower.includes('remote')) return 'Remote'
  if (lower.includes('hybrid')) return 'Hybrid'
  return 'On-site'
}

function resolveJobType(job: ApiJob): JobType {
  const title = (job.title ?? '').toLowerCase()
  const desc = (job.description ?? '').toLowerCase()

  if (
    title.includes('contract') ||
    title.includes('freelance') ||
    title.includes('temporary') ||
    title.includes('project') ||
    desc.includes('contractor') ||
    desc.includes('freelancer') ||
    desc.includes('temporary contract')
  ) {
    return 'Contract'
  }

  if (
    title.includes('part-time') ||
    title.includes('part time') ||
    title.includes('parttime') ||
    title.includes('intern') ||
    desc.includes('part-time') ||
    desc.includes('internship')
  ) {
    return 'Part-time'
  }

  return 'Full-time'
}

/** Map a raw API job to the frontend JobMatch shape. */
export function mapApiJobToJobMatch(job: ApiJob): JobMatch {
  // Build feature bullets from description sentences (max 3)
  const sentences = job.description
    .replace(/\n+/g, ' ')
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const features: JobFeature[] = sentences.map((text, i) => ({
    text,
    type: i === 0 ? 'check' : 'info',
  }))

  if (features.length === 0) {
    features.push({ text: job.location, type: 'info' })
  }

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: resolveLocation(job.location),
    jobType: resolveJobType(job),
    matchPct: Math.round(job.match_score),
    iconName: resolveIconName(job),
    features,
  }
}

export async function getJobMatches(
  params: GetJobMatchesParams = {}
): Promise<JobMatchPageResponse> {
  const { page = 1, pageSize = 6, filters } = params

  // Fetch real data from the backend
  const rawJobs = await fetchJobs()

  if (import.meta.env.DEV) {
    console.log(`[jobsApi] fetchJobs returned ${rawJobs.length} jobs`, rawJobs)
  }

  const mapped = rawJobs.map(mapApiJobToJobMatch)

  const safePage = Math.max(1, Math.floor(page))
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const minMatchPct = filters?.minMatchPct

  const filteredMatches = mapped.filter((job) => {
    if (filters?.location && job.location !== filters.location) return false
    if (filters?.type && job.jobType !== filters.type) return false
    if (typeof minMatchPct === 'number' && job.matchPct < minMatchPct) return false
    return true
  })

  const start = (safePage - 1) * safePageSize
  const end = start + safePageSize
  const items = filteredMatches.slice(start, end)

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    total: filteredMatches.length,
    hasMore: end < filteredMatches.length,
  }
}

export { getCustomCVs, deleteCustomCV, updateCustomCVBase, renameCustomCV }

export async function getCvContent(id: number): Promise<CVData> {
  const dbCv = await getCvDocumentById(id)
  return dbCvToCvData(dbCv)
}

export async function saveCvContent(id: number, data: CVData): Promise<void> {
  await patchCvDocument(id, cvDataToDbCv(data))
}

