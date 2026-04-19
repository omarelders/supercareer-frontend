import api from './api'

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
  const { data } = await api.get<AdminActivity[]>('/api/admin-tools/activities/')
  return data
}

export async function getAdminScrapingLogs(): Promise<AdminScrapingLog[]> {
  const { data } = await api.get<AdminScrapingLog[]>('/api/admin-tools/scraping-logs/')
  return data
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/api/admin-tools/stats/')
  return data
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/api/admin-tools/users/')
  return data
}

export async function toggleBlockUser(id: number): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>(`/api/admin-tools/users/${id}/toggle-block/`)
  return data
}
