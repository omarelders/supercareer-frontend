import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import {
  getJobMatches,
  type JobLocation,
  type JobMatch,
  type JobMatchFilters,
  type JobMatchPageResponse,
  type JobType,
} from '@/services/jobsApi'
import { refreshProjects } from '@/services/opportunitiesApi'

const JOB_MATCH_PAGE_SIZE = 6
const ALL_FILTER_VALUE = 'All'

export type JobViewMode = 'grid' | 'list'
export type LocationFilter = JobLocation | typeof ALL_FILTER_VALUE
export type TypeFilter = JobType | typeof ALL_FILTER_VALUE
export type MatchThreshold = 0 | 90 | 95

export interface JobFilterState {
  location: LocationFilter
  type: TypeFilter
  minMatchPct: MatchThreshold
}

export const DEFAULT_JOB_FILTERS: JobFilterState = {
  location: ALL_FILTER_VALUE,
  type: ALL_FILTER_VALUE,
  minMatchPct: 0,
}

interface JobsState {
  items: JobMatch[]
  page: number
  total: number
  hasMore: boolean
  isInitialLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  error: string | null
  loadMoreError: string | null
  refreshError: string | null
  viewMode: JobViewMode
  filters: JobFilterState
  queryKey: string
}

const initialState: JobsState = {
  items: [],
  page: 0,
  total: 0,
  hasMore: true,
  isInitialLoading: true,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,
  loadMoreError: null,
  refreshError: null,
  viewMode: 'grid',
  filters: DEFAULT_JOB_FILTERS,
  queryKey: JSON.stringify(DEFAULT_JOB_FILTERS),
}


function toApiFilters(filters: JobFilterState): JobMatchFilters {
  return {
    location: filters.location === ALL_FILTER_VALUE ? undefined : filters.location,
    type: filters.type === ALL_FILTER_VALUE ? undefined : filters.type,
    minMatchPct: filters.minMatchPct === 0 ? undefined : filters.minMatchPct,
  }
}

function toQueryKey(filters: JobFilterState): string {
  return JSON.stringify(filters)
}

export const fetchInitialJobMatches = createAsyncThunk<
  { response: JobMatchPageResponse; queryKey: string },
  void,
  { state: RootState; rejectValue: string }
>('jobs/fetchInitialMatches', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState()
    const queryKey = state.jobs.queryKey
    const response = await getJobMatches({
      page: 1,
      pageSize: JOB_MATCH_PAGE_SIZE,
      filters: toApiFilters(state.jobs.filters),
    })
    return { response, queryKey }
  } catch {
    return rejectWithValue('Failed to load job matches.')
  }
})

export const loadMoreJobMatches = createAsyncThunk<
  { response: JobMatchPageResponse; queryKey: string },
  void,
  { state: RootState; rejectValue: string }
>(
  'jobs/loadMoreMatches',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().jobs
      const queryKey = state.queryKey
      const response = await getJobMatches({
        page: state.page + 1,
        pageSize: JOB_MATCH_PAGE_SIZE,
        filters: toApiFilters(state.filters),
      })
      return { response, queryKey }
    } catch {
      return rejectWithValue('Failed to load more matches.')
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as RootState).jobs
      return !state.isInitialLoading && !state.isLoadingMore && state.hasMore
    },
  }
)

/**
 * Triggers the backend scraper to import fresh jobs, then re-fetches the
 * first page so the UI is immediately populated.
 */
export const refreshAndFetchJobs = createAsyncThunk<
  JobMatchPageResponse,
  void,
  { state: RootState; rejectValue: string }
>('jobs/refreshAndFetch', async (_, { getState, rejectWithValue }) => {
  try {
    // 1. Trigger the project scraper (jobs share the same refresh pipeline)
    await refreshProjects()
    // 2. Re-fetch the first page with current filters
    const state = getState().jobs
    return await getJobMatches({
      page: 1,
      pageSize: JOB_MATCH_PAGE_SIZE,
      filters: toApiFilters(state.filters),
    })
  } catch {
    return rejectWithValue('Failed to refresh job matches. Please try again.')
  }
})

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobViewMode: (state, action: PayloadAction<JobViewMode>) => {
      state.viewMode = action.payload
    },
    setJobFilters: (state, action: PayloadAction<Partial<JobFilterState>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.queryKey = toQueryKey(state.filters)
    },
    clearJobFilters: (state) => {
      state.filters = DEFAULT_JOB_FILTERS
      state.queryKey = toQueryKey(DEFAULT_JOB_FILTERS)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialJobMatches.pending, (state) => {
        state.isInitialLoading = true
        state.error = null
        state.loadMoreError = null
      })
      .addCase(fetchInitialJobMatches.fulfilled, (state, action) => {
        state.isInitialLoading = false
        // Discard stale responses (filter changed while request was in-flight)
        if (action.payload.queryKey !== state.queryKey) return
        state.items = action.payload.response.items
        state.page = action.payload.response.page
        state.total = action.payload.response.total
        state.hasMore = action.payload.response.hasMore
      })
      .addCase(fetchInitialJobMatches.rejected, (state, action) => {
        state.isInitialLoading = false
        if (action.error.name === 'AbortError') {
          return
        }
        state.error = action.payload ?? 'Failed to load job matches.'
      })
      .addCase(loadMoreJobMatches.pending, (state) => {
        state.isLoadingMore = true
        state.loadMoreError = null
      })
      .addCase(loadMoreJobMatches.fulfilled, (state, action) => {
        state.isLoadingMore = false
        if (action.payload.queryKey !== state.queryKey) {
          return
        }
        state.items = [...state.items, ...action.payload.response.items]
        state.page = action.payload.response.page
        state.total = action.payload.response.total
        state.hasMore = action.payload.response.hasMore
      })
      .addCase(loadMoreJobMatches.rejected, (state, action) => {
        state.isLoadingMore = false
        if (action.error.name === 'AbortError') return
        state.loadMoreError = action.payload ?? 'Failed to load more matches.'
      })
      // refreshAndFetchJobs
      .addCase(refreshAndFetchJobs.pending, (state) => {
        state.isRefreshing = true
        state.refreshError = null
        state.error = null
      })
      .addCase(refreshAndFetchJobs.fulfilled, (state, action) => {
        state.isRefreshing = false
        state.isInitialLoading = false
        state.items = action.payload.items
        state.page = action.payload.page
        state.total = action.payload.total
        state.hasMore = action.payload.hasMore
      })
      .addCase(refreshAndFetchJobs.rejected, (state, action) => {
        state.isRefreshing = false
        state.refreshError = action.payload ?? 'Failed to refresh jobs.'
      })
  },
})

export const { setJobViewMode, setJobFilters, clearJobFilters } = jobsSlice.actions

export const selectJobsState = (state: RootState) => state.jobs
export const selectHasActiveJobFilters = (state: RootState) =>
  state.jobs.filters.location !== DEFAULT_JOB_FILTERS.location ||
  state.jobs.filters.type !== DEFAULT_JOB_FILTERS.type ||
  state.jobs.filters.minMatchPct !== DEFAULT_JOB_FILTERS.minMatchPct

export default jobsSlice.reducer
