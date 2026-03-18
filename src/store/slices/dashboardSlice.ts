import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import {
  getDashboardJobMatches,
  getDashboardProjectMatches,
  getDashboardStats,
  type DashboardJobMatch,
  type DashboardProjectMatch,
  type DashboardStats,
} from '@/services/dashboardApi'

interface DashboardState {
  jobMatches: DashboardJobMatch[]
  projectMatches: DashboardProjectMatch[]
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
}

interface DashboardPayload {
  jobMatches: DashboardJobMatch[]
  projectMatches: DashboardProjectMatch[]
  stats: DashboardStats
}

const initialState: DashboardState = {
  jobMatches: [],
  projectMatches: [],
  stats: null,
  isLoading: true,
  error: null,
}

export const fetchDashboardOverview = createAsyncThunk<
  DashboardPayload,
  void,
  { rejectValue: string }
>('dashboard/fetchOverview', async (_, { rejectWithValue }) => {
  try {
    const [jobMatches, projectMatches, stats] = await Promise.all([
      getDashboardJobMatches(),
      getDashboardProjectMatches(),
      getDashboardStats(),
    ])
    return { jobMatches, projectMatches, stats }
  } catch {
    return rejectWithValue('Failed to load dashboard data.')
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobMatches = action.payload.jobMatches
        state.projectMatches = action.payload.projectMatches
        state.stats = action.payload.stats
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.isLoading = false
        if (action.error.name === 'AbortError') {
          return
        }
        state.error = action.payload ?? 'Failed to load dashboard data.'
      })
  },
})

export const selectDashboardState = (state: RootState) => state.dashboard

export default dashboardSlice.reducer
