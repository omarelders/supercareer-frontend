import { getDashboardStats as fetchDashboardStats } from './accountsApi'
import { fetchJobs, fetchProjects } from './opportunitiesApi'



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
  // Real API fields (snake_case from backend)
  matches_today: number
  active_proposals: number
  avg_match_score: number
  profile_views: number
  user_name: string
}


// Heuristic: pick an avatar colour from a stable palette based on job id
const LOGO_COLORS = [
  '#2d6a4f', '#1a3c5e', '#6b21a8', '#b45309', '#0e7490',
  '#be185d', '#166534', '#1e40af', '#7c3aed', '#b91c1c',
]

function logoColor(id: number): string {
  return LOGO_COLORS[id % LOGO_COLORS.length]
}

function logoInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export async function getDashboardJobMatches(): Promise<DashboardJobMatch[]> {
  try {
    const jobs = await fetchJobs()
    return jobs.slice(0, 3).map((job) => ({
      id: job.id,
      title: job.title,
      platform: job.source_platform,
      location: job.location,
      tags: [],        // API doesn't expose skill tags on the job list endpoint
      matchPct: Math.round(job.match_score),
      logo: logoInitials(job.company),
      logoColor: logoColor(job.id),
    }))
  } catch {
    return []
  }
}

export async function getDashboardProjectMatches(): Promise<DashboardProjectMatch[]> {
  try {
    const projects = await fetchProjects()
    return projects.slice(0, 3).map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: `Listed on ${project.platform_name}`,
      client: project.platform_name,
      status: 'Sent',   // No status on project listings; proposals start as Sent
      date: new Date(project.posted_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }))
  } catch {
    return []
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchDashboardStats()
}
