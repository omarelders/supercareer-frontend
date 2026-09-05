import api from './api'
// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { DEMO_STATS } from '@/demo/demoData'
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================

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
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return DEMO_STATS
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<DashboardStats>('/api/accounts/dashboard-stats/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[accountsApi] Server offline, falling back to demo stats:', err)
    return DEMO_STATS
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}
