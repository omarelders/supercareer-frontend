/**
 * cvDocumentSlice.ts
 *
 * Manages the async lifecycle of saving a CV to the backend via
 * POST /api/documents/cv/create/.
 *
 * The slice intentionally stays thin. State it tracks:
 *   - isSaving          – request in-flight
 *   - lastSaved         – the most recently persisted ApiCvDocument
 *   - error             – the last save error message (if any)
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { createCvDocument, type DbCV, cvDataToDbCv } from '@/services/documentsApi'
import type { CVData } from '@/features/cv-builder/types'

// ---------------------------------------------------------------------------
// Thunk
// ---------------------------------------------------------------------------

export const saveCvDocument = createAsyncThunk<
  DbCV,
  CVData,
  { rejectValue: string }
>('cvDocument/save', async (payload, { rejectWithValue }) => {
  try {
    const apiPayload = cvDataToDbCv(payload)
    return await createCvDocument(apiPayload)
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
