import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { getCustomCVs, deleteCustomCV, updateCustomCVBase, type CustomCV } from '@/services/jobsApi'

const CUSTOM_CV_PAGE_SIZE = 5

interface CustomCvState {
  items: CustomCV[]
  isLoading: boolean
  error: string | null
  currentPage: number
}

const initialState: CustomCvState = {
  items: [],
  isLoading: true,
  error: null,
  currentPage: 1,
}

export const fetchCustomCVs = createAsyncThunk<
  CustomCV[],
  void,
  { rejectValue: string }
>('customCv/fetchCustomCVs', async (_, { rejectWithValue }) => {
  try {
    return await getCustomCVs()
  } catch {
    return rejectWithValue('Failed to load CVs.')
  }
})

export const deleteCV = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>('customCv/deleteCV', async (id, { rejectWithValue }) => {
  try {
    await deleteCustomCV(id)
    return id
  } catch {
    return rejectWithValue('Failed to delete CV.')
  }
})

export const makeBaseCv = createAsyncThunk<
  CustomCV[],
  number,
  { rejectValue: string }
>('customCv/makeBaseCv', async (id, { rejectWithValue }) => {
  try {
    return await updateCustomCVBase(id)
  } catch {
    return rejectWithValue('Failed to update base CV.')
  }
})

const customCvSlice = createSlice({
  name: 'customCv',
  initialState,
  reducers: {
    setCustomCvPage: (state, action: PayloadAction<number>) => {
      const totalPages = Math.max(1, Math.ceil(state.items.length / CUSTOM_CV_PAGE_SIZE))
      state.currentPage = Math.max(1, Math.min(totalPages, action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(deleteCV.fulfilled, (state, action) => {
        state.items = state.items.filter((cv) => cv.id !== action.payload)
        const totalPages = Math.max(1, Math.ceil(state.items.length / CUSTOM_CV_PAGE_SIZE))
        state.currentPage = Math.min(state.currentPage, totalPages)
      })
      .addCase(makeBaseCv.fulfilled, (state, action) => {
        state.items = action.payload
      })
  },
})

export const { setCustomCvPage } = customCvSlice.actions

export const selectCustomCvState = (state: RootState) => state.customCv
export const selectCustomCvPagination = createSelector(selectCustomCvState, (state) => {
  const totalItems = state.items.length
  const totalPages = Math.ceil(totalItems / CUSTOM_CV_PAGE_SIZE)
  const startIndex = (state.currentPage - 1) * CUSTOM_CV_PAGE_SIZE
  const endIndex = startIndex + CUSTOM_CV_PAGE_SIZE
  const paginatedItems = state.items.slice(startIndex, endIndex)

  return {
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    allItems: state.items,
    itemsPerPage: CUSTOM_CV_PAGE_SIZE,
  }
})

export default customCvSlice.reducer
