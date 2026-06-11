/**
 * cvDocumentSlice.ts
 *
 * Manages the async lifecycle of saving a CV from the CV Builder.
 *
 * "Save Draft" in the CV Builder creates a REGULAR (non-base) CV via:
 *   POST /api/documents/cv/
 *
 * It does NOT create a Base CV. The user can mark any CV as Base
 * from the Custom CVs page via the "Make as Base CV" dropdown option.
 *
 * After a successful save, `fetchCustomCVs` is dispatched so the
 * Custom CVs list is immediately up to date.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { createCvDocument, type DbCV } from '@/services/documentsApi'
import { fetchCustomCVs } from '@/store/slices/customCvSlice'
import type { CVData } from '@/features/cv-builder/types'

// ---------------------------------------------------------------------------
// Thunk: create a new regular CV from the CV Builder
// ---------------------------------------------------------------------------

export const saveCvDocument = createAsyncThunk<
  DbCV,
  CVData,
  { rejectValue: string }
>('cvDocument/save', async (payload, { rejectWithValue, dispatch }) => {
  try {
    // Always create a NEW regular CV — not a base CV
    const created = await createCvDocument(payload)

    // Refresh the Custom CVs list so the new entry appears immediately
    dispatch(fetchCustomCVs())

    return created
  } catch {
    return rejectWithValue('Failed to save CV. Please try again.')
  }
})

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

interface CvDocumentState {
  isSaving: boolean
  lastSaved: DbCV | null
  error: string | null
}

const initialState: CvDocumentState = {
  isSaving: false,
  lastSaved: null,
  error: null,
}

const cvDocumentSlice = createSlice({
  name: 'cvDocument',
  initialState,
  reducers: {
    clearCvDocumentError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveCvDocument.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(saveCvDocument.fulfilled, (state, action) => {
        state.isSaving = false
        state.lastSaved = action.payload
      })
      .addCase(saveCvDocument.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload ?? 'Failed to save CV.'
      })
  },
})

export const { clearCvDocumentError } = cvDocumentSlice.actions

export const selectCvDocumentState = (state: RootState) => state.cvDocument

export default cvDocumentSlice.reducer
