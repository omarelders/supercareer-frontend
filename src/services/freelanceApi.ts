import axios from 'axios'
import { delay } from './request'



export interface ProjectMatch {
  id: number
  title: string
  matchPct: number
  budget: string
  budgetType: string
  client: string
  postedTime: string
  location: string
  description: string
  tags: string[]
}

export interface Proposal {
  id: number
  date: string
  title: string
  status: 'Sent' | 'In Review' | 'Accepted' | 'Rejected'
  client: string
}



const MOCK_PROJECT_MATCHES: ProjectMatch[] = [
  {
    id: 1,
    title: 'Modern SaaS Landing Page Design',
    matchPct: 98,
    budget: '$2,500',
    budgetType: 'Fixed Budget',
    client: 'MetaScale Labs',
    postedTime: 'Posted 2h ago',
    location: 'United States',
    description:
      "We're looking for a top-tier UI designer to revamp our core landing page. Experience with Tailwind CSS and dark mode aesth must. Must be able to deliver high-fidelity prototypes in Figma...",
    tags: ['UI Design', 'Tailwind CSS', 'Responsive'],
  },
  {
    id: 2,
    title: 'Full-stack React/Node Developer',
    matchPct: 92,
    budget: '$65/hr',
    budgetType: 'Hourly Rate',
    client: 'FinGo Tech',
    postedTime: 'Posted 5h ago',
    location: 'Remote (Global)',
    description:
      'Need an experienced developer to help us integrate a new payment gateway and refactor our dashboard components. Long term project with potential for extension.',
    tags: ['React', 'Node.js', 'API Integration'],
  },
  {
    id: 3,
    title: 'E-commerce Mobile Design',
    matchPct: 85,
    budget: '$4,000',
    budgetType: 'Fixed Budget',
    client: 'UrbanThreads',
    postedTime: 'Posted 1d ago',
    location: 'United Kingdom',
    description:
      'UI/UX designer needed for a fashion e-commerce application. Focus on mobile-first design and conversion optimization.',
    tags: ['Mobile Design', 'Figma'],
  },
]

const MOCK_PROPOSALS: Proposal[] = [
  ...Array.from({ length: 6 }).flatMap((_, i) => [
    { id: i * 4 + 1, date: 'Oct 24, 2023', title: 'E-commerce Redesign Strategy', status: 'Sent', client: 'Shopify Plus Partner' } as Proposal,
    { id: i * 4 + 2, date: 'Oct 22, 2023', title: 'Mobile App UI/UX Discovery', status: 'Accepted', client: 'FinTech Solutions' } as Proposal,
    { id: i * 4 + 3, date: 'Oct 18, 2023', title: 'SaaS Landing Page Concept', status: 'In Review', client: 'CloudFlow Inc.' } as Proposal,
    { id: i * 4 + 4, date: 'Oct 12, 2023', title: 'Brand Identity System', status: 'Rejected', client: 'Apex Marketing' } as Proposal,
  ])
]

const api = axios.create({ baseURL: '/api' })

export async function getProjectMatches(): Promise<ProjectMatch[]> {
  await delay(800)
  void api
  return MOCK_PROJECT_MATCHES
}

export async function getProposals(): Promise<Proposal[]> {
  await delay(800)
  return MOCK_PROPOSALS
}
