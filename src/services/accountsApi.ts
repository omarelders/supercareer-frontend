import api from './api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface DashboardStats {
  matches_today: number
  active_proposals: number
  avg_match_score: number
  profile_views: number
  user_name: string
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * GET /api/accounts/dashboard-stats/
 * Returns stats for the currently authenticated user's dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/api/accounts/dashboard-stats/')
  return data
}
