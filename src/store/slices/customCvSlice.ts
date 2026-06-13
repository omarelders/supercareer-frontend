import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import {
  getCustomCVs,
  deleteCustomCV,
  updateCustomCVBase,
  renameCustomCV,
  createJobTailoredCv,
  type CustomCV,
} from '@/services/jobsApi'
import {
  getBaseCv,
  type DbCV,
} from '@/services/documentsApi'

export function mapDbCvToCustomCv(dbCv: DbCV): CustomCV {
  const d = new Date(dbCv.created_at)
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const localTitle = typeof window !== 'undefined' ? localStorage.getItem(`cv_title_${dbCv.id}`) : null
  return {
    id: dbCv.id,
    date: dateStr,
    title: localTitle || dbCv.professional_title || dbCv.full_name || 'Untitled CV',
    appliedTo: dbCv.job ? `Job Matching (ID #${dbCv.job})` : 'General Application',
    base_cv: dbCv.is_base,
  }
}

const CUSTOM_CV_PAGE_SIZE = 5

interface CustomCvState {
  items: CustomCV[]
  baseCv: DbCV | null
  baseCvLoading: boolean
  isLoading: boolean
  error: string | null
  currentPage: number
  /** ID of a CV being created via the job tailoring endpoint */
  tailoringJobId: number | null
  tailoringError: string | null
}

const initialState: CustomCvState = {
  items: [],
  baseCv: null,
  baseCvLoading: false,
  isLoading: true,
  error: null,
  currentPage: 1,
  tailoringJobId: null,
  tailoringError: null,
}

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchCustomCVs = createAsyncThunk<
  CustomCV[],
  void,
  { rejectValue: string }
>('customCv/fetchCustomCVs', async (_, { rejectWithValue }) => {
  try {
    const data = await getCustomCVs()
    return data.map(mapDbCvToCustomCv)
  } catch {
    return rejectWithValue('Failed to load CVs.')
  }
})

/** Fetch the Base CV so the page knows whether one exists. */
export const fetchBaseCv = createAsyncThunk<
  DbCV,
  void,
  { rejectValue: string }
>('customCv/fetchBaseCv', async (_, { rejectWithValue }) => {
  try {
    return await getBaseCv()
  } catch {
    // 404 means no base CV yet — not a hard error
    return rejectWithValue('No base CV found.')
  }
})

export const deleteCV = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('customCv/deleteCV', async (id, { rejectWithValue, dispatch }) => {
  try {
    await deleteCustomCV(id)
    return id
  } catch {
    dispatch(fetchCustomCVs())
    return rejectWithValue('Failed to delete CV.')
  }
})

export const makeBaseCv = createAsyncThunk<
  CustomCV[],
  number,
  { rejectValue: string }
>('customCv/makeBaseCv', async (id, { rejectWithValue, dispatch }) => {
  try {
    const data = await updateCustomCVBase(id)
    return data.map(mapDbCvToCustomCv)
  } catch {
    dispatch(fetchCustomCVs())
    return rejectWithValue('Failed to update base CV.')
  }
})

export const renameCV = createAsyncThunk<
  CustomCV[],
  { id: number; newTitle: string },
  { rejectValue: string }
>('customCv/renameCV', async ({ id, newTitle }, { rejectWithValue, dispatch }) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cv_title_${id}`, newTitle)
    }
    const data = await renameCustomCV(id, newTitle)
    return data.map(mapDbCvToCustomCv)
  } catch {
    dispatch(fetchCustomCVs())
    return rejectWithValue('Failed to rename CV.')
  }
})

/**
 * Create an AI-tailored CV for a specific job via POST /api/documents/cv/job/{job_id}/.
 * On success, refreshes the CV list so the new entry appears.
 * Returns the new CV's ID so callers can navigate to its edit page.
 */
export const createTailoredCv = createAsyncThunk<
  number, // the new CV's id
  number, // jobId
  { rejectValue: string }
>('customCv/createTailoredCv', async (jobId, { rejectWithValue, dispatch }) => {
  try {
    const newCv = await createJobTailoredCv(jobId)
    // Refresh the list in the background
    dispatch(fetchCustomCVs())
    return newCv.id
  } catch {
    return rejectWithValue('Failed to create tailored CV for this job.')
  }
})

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const customCvSlice = createSlice({
  name: 'customCv',
  initialState,
  reducers: {
    setCustomCvPage: (state, action: PayloadAction<number>) => {
      const totalPages = Math.max(1, Math.ceil(state.items.length / CUSTOM_CV_PAGE_SIZE))
      state.currentPage = Math.max(1, Math.min(totalPages, action.payload))
    },
    clearTailoringError: (state) => {
      state.tailoringError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCustomCVs
      .addCase(fetchCustomCVs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomCVs.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        const totalPages = Math.max(1, Math.ceil(action.payload.length / CUSTOM_CV_PAGE_SIZE))
        state.currentPage = Math.min(state.currentPage, totalPages)
      })
      .addCase(fetchCustomCVs.rejected, (state, action) => {
        state.isLoading = false
        if (action.error.name === 'AbortError') {
          return
        }
        state.error = action.payload ?? 'Failed to load CVs.'
      })
      // fetchBaseCv
      .addCase(fetchBaseCv.pending, (state) => {
        state.baseCvLoading = true
      })
      .addCase(fetchBaseCv.fulfilled, (state, action) => {
        state.baseCvLoading = false
        state.baseCv = action.payload
      })
      .addCase(fetchBaseCv.rejected, (state) => {
        state.baseCvLoading = false
        state.baseCv = null // No base CV
      })
      // deleteCV
      .addCase(deleteCV.pending, (state, action) => {
        state.items = state.items.filter((cv) => cv.id !== action.meta.arg)
        const totalPages = Math.max(1, Math.ceil(state.items.length / CUSTOM_CV_PAGE_SIZE))
        state.currentPage = Math.min(state.currentPage, totalPages)
      })
      // makeBaseCv
      .addCase(makeBaseCv.pending, (state, action) => {
        state.items.forEach(cv => {
          cv.base_cv = cv.id === action.meta.arg
        })
      })
      .addCase(makeBaseCv.fulfilled, (state, action) => {
        state.items = action.payload
      })
      // renameCV
      .addCase(renameCV.pending, (state, action) => {
        const item = state.items.find(cv => cv.id === action.meta.arg.id)
        if (item) {
          item.title = action.meta.arg.newTitle
        }
      })
      .addCase(renameCV.fulfilled, (state, action) => {
        state.items = action.payload
      })
      // createTailoredCv
      .addCase(createTailoredCv.pending, (state, action) => {
        state.tailoringJobId = action.meta.arg
        state.tailoringError = null
      })
      .addCase(createTailoredCv.fulfilled, (state) => {
        state.tailoringJobId = null
      })
      .addCase(createTailoredCv.rejected, (state, action) => {
        state.tailoringJobId = null
        state.tailoringError = action.payload ?? 'Failed to create tailored CV.'
      })
  },
})

export const { setCustomCvPage, clearTailoringError } = customCvSlice.actions

export const selectCustomCvState = (state: RootState) => state.customCv
export const selectBaseCv = (state: RootState) => state.customCv.baseCv
export const selectCustomCvPagination = createSelector(selectCustomCvState, (state) => {
  const allItems = state.items
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / CUSTOM_CV_PAGE_SIZE)
  const startIndex = (state.currentPage - 1) * CUSTOM_CV_PAGE_SIZE
  const endIndex = startIndex + CUSTOM_CV_PAGE_SIZE
  const paginatedItems = allItems.slice(startIndex, endIndex)

  return {
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    allItems,
    itemsPerPage: CUSTOM_CV_PAGE_SIZE,
  }
})

export default customCvSlice.reducer
