import api from './api'
// ============================================================================
// >>> DEMO_MOCK_DATA_START <<<
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import {
  DEMO_ADMIN_ACTIVITIES,
  DEMO_ADMIN_SCRAPING_LOGS,
} from '@/demo/demoData'
import {
  getStoredDemoAdminUsers,
  toggleStoredDemoUserBlock,
  getStoredDemoAdminStats,
} from '@/demo/demoStorage'
// >>> DEMO_MOCK_DATA_END <<<
// ============================================================================

export interface AdminActivity {
  id: number
  admin: number
  admin_name: string
  action: string
  target_user: number
  target_user_name: string
  created_at: string
}

export interface AdminScrapingLog {
  id: number
  source_name: string
  status: string
  details: string
  created_at: string
}

export interface AdminStats {
  total_users: number
  total_jobs: number
  total_projects: number
  active_users: number
  blocked_users: number
}

export interface AdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
}

export async function getAdminActivities(): Promise<AdminActivity[]> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return DEMO_ADMIN_ACTIVITIES
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<AdminActivity[]>('/api/admin-tools/activities/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[adminApi] Server offline, falling back to demo admin activities:', err)
    return DEMO_ADMIN_ACTIVITIES
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function getAdminScrapingLogs(): Promise<AdminScrapingLog[]> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return DEMO_ADMIN_SCRAPING_LOGS
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<AdminScrapingLog[]>('/api/admin-tools/scraping-logs/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[adminApi] Server offline, falling back to demo scraping logs:', err)
    return DEMO_ADMIN_SCRAPING_LOGS
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return getStoredDemoAdminStats()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<AdminStats>('/api/admin-tools/stats/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[adminApi] Server offline, falling back to demo admin stats:', err)
    return getStoredDemoAdminStats()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return getStoredDemoAdminUsers()
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.get<AdminUser[]>('/api/admin-tools/users/')
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    console.warn('[adminApi] Server offline, falling back to demo admin users:', err)
    return getStoredDemoAdminUsers()
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}

export async function toggleBlockUser(id: number): Promise<AdminUser> {
  // ============================================================================
  // >>> DEMO_MOCK_DATA_START <<<
  if (IS_DEMO_MODE) {
    return toggleStoredDemoUserBlock(id)
  }
  // >>> DEMO_MOCK_DATA_END <<<
  // ============================================================================

  try {
    const { data } = await api.post<AdminUser>(`/api/admin-tools/users/${id}/toggle-block/`)
    return data
  } catch (err) {
    // ============================================================================
    // >>> DEMO_MOCK_DATA_START <<<
    return toggleStoredDemoUserBlock(id)
    // >>> DEMO_MOCK_DATA_END <<<
    // ============================================================================
  }
}
