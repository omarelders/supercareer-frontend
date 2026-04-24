import { fetchJobs, type ApiJob } from './opportunitiesApi'
import { delay } from './request'



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




const MOCK_CUSTOM_CVS: CustomCV[] = [
  ...Array.from({ length: 4 }).flatMap((_, i) => [
    { id: i * 6 + 1, date: 'Oct 24, 2023', title: 'Senior Frontend Developer CV', appliedTo: 'TechCorp International', base_cv: i === 0 } as CustomCV,
    { id: i * 6 + 2, date: 'Oct 20, 2023', title: 'UX Designer - FinTech Specialist', appliedTo: 'NeoBank Systems', base_cv: false } as CustomCV,
    { id: i * 6 + 3, date: 'Oct 15, 2023', title: 'Full Stack Engineer (Node.js)', appliedTo: 'WebFlow Studios', base_cv: false } as CustomCV,
    { id: i * 6 + 4, date: 'Oct 10, 2023', title: 'Product Manager Role - Tech Startup', appliedTo: 'Launchpad AI', base_cv: false } as CustomCV,
    { id: i * 6 + 5, date: 'Oct 05, 2023', title: 'Frontend Engineer - Creative Focus', appliedTo: 'Designly Agency', base_cv: false } as CustomCV,
    { id: i * 6 + 6, date: 'Oct 01, 2023', title: 'React Native Developer', appliedTo: 'MobileFirst', base_cv: false } as CustomCV,
  ])
]

const CUSTOM_CVS_STORAGE_KEY = 'supercareer_custom_cvs'

function getStoredCVs(): CustomCV[] {
  const stored = localStorage.getItem(CUSTOM_CVS_STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(CUSTOM_CVS_STORAGE_KEY, JSON.stringify(MOCK_CUSTOM_CVS))
    return MOCK_CUSTOM_CVS
  }
  return JSON.parse(stored)
}

function saveStoredCVs(cvs: CustomCV[]) {
  localStorage.setItem(CUSTOM_CVS_STORAGE_KEY, JSON.stringify(cvs))
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
    jobType: 'Full-time',        // backend doesn't expose this yet
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

export async function getCustomCVs(): Promise<CustomCV[]> {
  await delay(800)
  return getStoredCVs()
}

export async function deleteCustomCV(id: number): Promise<void> {
  await delay(500)
  const cvs = getStoredCVs()
  saveStoredCVs(cvs.filter((cv) => cv.id !== id))
}

export async function updateCustomCVBase(id: number): Promise<CustomCV[]> {
  await delay(500)
  const cvs = getStoredCVs().map((cv) => ({
    ...cv,
    base_cv: cv.id === id,
  }))
  saveStoredCVs(cvs)
  return cvs
}
