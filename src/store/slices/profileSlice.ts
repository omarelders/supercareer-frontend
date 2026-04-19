import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { getDashboardStats, type DashboardStats } from '@/services/accountsApi'
import {
  getAdminActivities,
  getAdminScrapingLogs,
  getAdminStats,
  getAdminUsers,
  toggleBlockUser as apiToggleBlockUser,
  type AdminActivity,
  type AdminScrapingLog,
  type AdminStats,
  type AdminUser,
} from '@/services/adminApi'

interface ProfileState {
  dashboardStats: DashboardStats | null
  adminActivities: AdminActivity[]
  adminScrapingLogs: AdminScrapingLog[]
  adminStats: AdminStats | null
  adminUsers: AdminUser[]
  /** IDs of users whose block status has been toggled (client-side tracking). */
  blockedUserIds: number[]
  isLoading: boolean
  /** Top-level error only set when ALL calls fail. */
  error: string | null
  /** Per-section errors shown inline when only that section fails. */
  sectionErrors: Partial<Record<'dashboardStats' | 'adminActivities' | 'adminScrapingLogs' | 'adminStats' | 'adminUsers', string>>
}

const initialState: ProfileState = {
  dashboardStats: null,
  adminActivities: [],
  adminScrapingLogs: [],
  adminStats: null,
  adminUsers: [],
  blockedUserIds: [],
  isLoading: true,
  error: null,
  sectionErrors: {},
}

interface ProfilePayload {
  dashboardStats: DashboardStats | null
  adminActivities: AdminActivity[]
  adminScrapingLogs: AdminScrapingLog[]
  adminStats: AdminStats | null
  adminUsers: AdminUser[]
  sectionErrors: ProfileState['sectionErrors']
}

export const fetchProfileData = createAsyncThunk<ProfilePayload, void, { rejectValue: string }>(
  'profile/fetchData',
  async (_, { rejectWithValue }) => {
    // Use allSettled so one failing endpoint (e.g. 403 on admin routes)
    // does NOT prevent the others from resolving.
    const [statsResult, activitiesResult, scrapingResult, adminStatsResult, usersResult] =
      await Promise.allSettled([
        getDashboardStats(),
        getAdminActivities(),
        getAdminScrapingLogs(),
        getAdminStats(),
        getAdminUsers(),
      ])

    const sectionErrors: ProfileState['sectionErrors'] = {}

    const dashboardStats = statsResult.status === 'fulfilled' ? statsResult.value : null
    if (statsResult.status === 'rejected') sectionErrors.dashboardStats = 'Could not load account stats.'

    const adminActivities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : []
    if (activitiesResult.status === 'rejected') sectionErrors.adminActivities = 'Could not load activity log.'

    const adminScrapingLogs = scrapingResult.status === 'fulfilled' ? scrapingResult.value : []
    if (scrapingResult.status === 'rejected') sectionErrors.adminScrapingLogs = 'Could not load scraping logs.'

    const adminStats = adminStatsResult.status === 'fulfilled' ? adminStatsResult.value : null
    if (adminStatsResult.status === 'rejected') sectionErrors.adminStats = 'Could not load platform stats.'

    const adminUsers = usersResult.status === 'fulfilled' ? usersResult.value : []
    if (usersResult.status === 'rejected') sectionErrors.adminUsers = 'Could not load users.'

    // Only hard-fail if every single call failed
    const allFailed = [statsResult, activitiesResult, scrapingResult, adminStatsResult, usersResult]
      .every((r) => r.status === 'rejected')
    if (allFailed) return rejectWithValue('Failed to load profile data.')

    return { dashboardStats, adminActivities, adminScrapingLogs, adminStats, adminUsers, sectionErrors }
  },
)

export const toggleBlockUser = createAsyncThunk<AdminUser, number, { rejectValue: string }>(
  'profile/toggleBlockUser',
  async (userId, { rejectWithValue }) => {
    try {
      const updatedUser = await apiToggleBlockUser(userId)
      return updatedUser
    } catch {
      return rejectWithValue('Failed to toggle block status.')
    }
  },
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProfileData.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.dashboardStats = action.payload.dashboardStats
        state.adminActivities = action.payload.adminActivities
        state.adminScrapingLogs = action.payload.adminScrapingLogs
        state.adminStats = action.payload.adminStats
        state.adminUsers = action.payload.adminUsers
        state.sectionErrors = action.payload.sectionErrors
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.isLoading = false
        if (action.error.name === 'AbortError') return
        state.error = action.payload ?? 'Failed to load profile data.'
      })
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const updatedUser = action.payload
        const index = state.adminUsers.findIndex((u) => u.id === updatedUser.id)
        if (index !== -1) {
          state.adminUsers[index] = updatedUser
        }
        // Toggle client-side blocked marker (API has no `is_blocked` field)
        const blockedSet = new Set(state.blockedUserIds)
        if (blockedSet.has(updatedUser.id)) {
          blockedSet.delete(updatedUser.id)
        } else {
          blockedSet.add(updatedUser.id)
        }
        state.blockedUserIds = Array.from(blockedSet)
      })
  },
})

export const selectProfileState = (state: RootState) => state.profile

export default profileSlice.reducer
