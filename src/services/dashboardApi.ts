import axios from 'axios'
import { delay } from './request'



export interface DashboardJobMatch {
  id: number
  title: string
  platform: string
  location: string
  tags: string[]
  matchPct: number
  logo: string
  logoColor: string
}

export interface DashboardProjectMatch {
  id: number
  title: string
  subtitle: string
  client: string
  status: 'In Review' | 'Interviewing' | 'Sent' | 'Accepted' | 'Rejected'
  date: string
}

export interface DashboardStats {
  matchesToday: number
  matchesTodayChange: number
  avgMatchScore: number
  avgMatchScoreChange: number
  activeProposals: number
  profileViews: number
  profileViewsChange: number
}



const MOCK_JOB_MATCHES: DashboardJobMatch[] = [
  {
    id: 1,
    title: 'Lead Product Designer',
    platform: 'LinkedIn',
    location: 'Remote',
    tags: ['FIGMA', 'REACT', 'DESIGN SYSTEMS'],
    matchPct: 98,
    logo: 'Sy',
    logoColor: '#2d6a4f',
  },
  {
    id: 2,
    title: 'Senior UI Developer',
    platform: 'Upwork',
    location: 'Freelance (Remote)',
    tags: ['TAILWIND CSS', 'VUE.JS'],
    matchPct: 94,
    logo: 'Lo',
    logoColor: '#1a3c5e',
  },
  {
    id: 3,
    title: 'UX Researcher',
    platform: 'Toptal',
    location: 'Project (Contract)',
    tags: ['USER TESTS', 'HOTJAR'],
    matchPct: 91,
    logo: 'Sy',
    logoColor: '#2d6a4f',
  },
]

const MOCK_PROJECT_MATCHES: DashboardProjectMatch[] = [
  {
    id: 1,
    title: 'Build a Flutter App for Online Learning',
    subtitle: 'Proposal Sent via Upwork',
    client: 'Nova Stream Systems',
    status: 'In Review',
    date: 'Oct 24, 2023',
  },
  {
    id: 2,
    title: 'Principal Product Designer',
    subtitle: 'Custom CV Sent via LinkedIn',
    client: 'Stripe',
    status: 'Interviewing',
    date: 'Oct 21, 2023',
  },
  {
    id: 3,
    title: 'HealthApp Mobile UI',
    subtitle: 'Proposal Sent via Toptal',
    client: 'CureBase Inc.',
    status: 'Sent',
    date: 'Oct 19, 2023',
  },
]

const MOCK_STATS: DashboardStats = {
  matchesToday: 24,
  matchesTodayChange: 12,
  avgMatchScore: 92,
  avgMatchScoreChange: 5,
  activeProposals: 18,
  profileViews: 142,
  profileViewsChange: 28,
}

const api = axios.create({ baseURL: '/api' })



export async function getDashboardJobMatches(): Promise<DashboardJobMatch[]> {
  await delay(800)
  void api 
  return MOCK_JOB_MATCHES
}

export async function getDashboardProjectMatches(): Promise<DashboardProjectMatch[]> {
  await delay(800)
  return MOCK_PROJECT_MATCHES
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(800)
  return MOCK_STATS
}
