import axios from 'axios'
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
  status: 'Completed' | 'Draft'
  format: string
}


const MOCK_JOB_MATCHES: JobMatch[] = [
  {
    id: 1,
    title: 'Senior UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    jobType: 'Contract',
    matchPct: 98,
    iconName: 'Cloud',
    features: [
      { text: 'Figma, Design Systems, Prototyping', type: 'check' },
      { text: '5+ Years Experience', type: 'check' },
      { text: 'Budget: $120k - $150k', type: 'info' },
    ],
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Hybrid',
    jobType: 'Full-time',
    matchPct: 95,
    iconName: 'Terminal',
    features: [
      { text: 'React, Tailwind, TypeScript', type: 'check' },
      { text: 'Available immediately', type: 'check' },
      { text: 'Industry: SaaS, FinTech', type: 'info' },
    ],
  },
  {
    id: 3,
    title: 'Product Manager',
    company: 'Innovate Solutions',
    location: 'Remote',
    jobType: 'Full-time',
    matchPct: 92,
    iconName: 'Share2',
    features: [
      { text: 'Agile, Roadmap, Data Analysis', type: 'check' },
      { text: 'B2B Product Experience', type: 'check' },
      { text: 'Location match: 100%', type: 'info' },
    ],
  },
  {
    id: 4,
    title: 'Backend Engineer',
    company: 'Cloud Systems',
    location: 'On-site',
    jobType: 'Full-time',
    matchPct: 91,
    iconName: 'Database',
    features: [
      { text: 'Node.js, PostgreSQL, Redis', type: 'check' },
      { text: 'Requires Relocation', type: 'info' },
      { text: 'Seniority: Expert', type: 'check' },
    ],
  },
  {
    id: 5,
    title: 'Data Scientist',
    company: 'Data Insights',
    location: 'Remote',
    jobType: 'Contract',
    matchPct: 90,
    iconName: 'BarChart2',
    features: [
      { text: 'Python, PyTorch, SQL', type: 'check' },
      { text: "Ph.D. or Master's in STEM", type: 'check' },
      { text: 'Budget: $140k - $180k', type: 'info' },
    ],
  },
  {
    id: 6,
    title: 'Creative Director',
    company: 'Media Agency',
    location: 'Hybrid',
    jobType: 'Part-time',
    matchPct: 90,
    iconName: 'Palette',
    features: [
      { text: 'Brand Vision, Art Direction', type: 'check' },
      { text: 'Strong Portfolio', type: 'check' },
      { text: 'Contract: 6 Months', type: 'info' },
    ],
  },
]

const TOTAL_MOCK_JOB_MATCHES = 24
const EXTENDED_MOCK_JOB_MATCHES: JobMatch[] = Array.from(
  { length: TOTAL_MOCK_JOB_MATCHES },
  (_, index) => {
    const base = MOCK_JOB_MATCHES[index % MOCK_JOB_MATCHES.length]
    const cycle = Math.floor(index / MOCK_JOB_MATCHES.length)
    return {
      ...base,
      id: index + 1,
      company: cycle === 0 ? base.company : `${base.company} ${cycle + 1}`,
    }
  }
)

const MOCK_CUSTOM_CVS: CustomCV[] = [
  ...Array.from({ length: 4 }).flatMap((_, i) => [
    { id: i * 6 + 1, date: 'Oct 24, 2023', title: 'Senior Frontend Developer CV', appliedTo: 'TechCorp International', status: 'Completed', format: 'PDF' } as CustomCV,
    { id: i * 6 + 2, date: 'Oct 20, 2023', title: 'UX Designer - FinTech Specialist', appliedTo: 'NeoBank Systems', status: 'Completed', format: 'PDF' } as CustomCV,
    { id: i * 6 + 3, date: 'Oct 15, 2023', title: 'Full Stack Engineer (Node.js)', appliedTo: 'WebFlow Studios', status: 'Completed', format: 'PDF' } as CustomCV,
    { id: i * 6 + 4, date: 'Oct 10, 2023', title: 'Product Manager Role - Tech Startup', appliedTo: 'Launchpad AI', status: 'Draft', format: '-' } as CustomCV,
    { id: i * 6 + 5, date: 'Oct 05, 2023', title: 'Frontend Engineer - Creative Focus', appliedTo: 'Designly Agency', status: 'Completed', format: 'PDF' } as CustomCV,
    { id: i * 6 + 6, date: 'Oct 01, 2023', title: 'React Native Developer', appliedTo: 'MobileFirst', status: 'Completed', format: 'PDF' } as CustomCV,
  ])
]

const api = axios.create({ baseURL: '/api' })



export async function getJobMatches(
  params: GetJobMatchesParams = {}
): Promise<JobMatchPageResponse> {
  const { page = 1, pageSize = 6, filters } = params
  await delay(800)
  void api
  const safePage = Math.max(1, Math.floor(page))
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const minMatchPct = filters?.minMatchPct
  const filteredMatches = EXTENDED_MOCK_JOB_MATCHES.filter((job) => {
    if (filters?.location && job.location !== filters.location) {
      return false
    }
    if (filters?.type && job.jobType !== filters.type) {
      return false
    }
    if (typeof minMatchPct === 'number' && job.matchPct < minMatchPct) {
      return false
    }
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
  return MOCK_CUSTOM_CVS
}
