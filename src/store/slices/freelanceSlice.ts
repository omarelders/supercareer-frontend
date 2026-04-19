import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import {
  getProjectMatches,
  getProposals,
  submitProposal,
  updateProposalStatus,
  type ProjectMatch,
  type Proposal,
  type CreateProposalPayload,
  type PatchProposalPayload,
} from '@/services/freelanceApi'

const PROPOSAL_PAGE_SIZE = 5

export const PROPOSAL_TABS = ['All Proposals', 'Sent', 'In Review', 'Accepted', 'Rejected'] as const
export type ProposalTab = (typeof PROPOSAL_TABS)[number]

interface FreelanceState {
  projects: {
    items: ProjectMatch[]
    isLoading: boolean
    error: string | null
  }
  proposals: {
    items: Proposal[]
    isLoading: boolean
    error: string | null
    currentPage: number
    activeTab: ProposalTab
  }
}

const initialState: FreelanceState = {
  projects: {
    items: [],
    isLoading: true,
    error: null,
  },
  proposals: {
    items: [],
    isLoading: true,
    error: null,
    currentPage: 1,
    activeTab: 'All Proposals',
  },
}

export const fetchProjectMatches = createAsyncThunk<
  ProjectMatch[],
  void,
  { rejectValue: string }
>('freelance/fetchProjectMatches', async (_, { rejectWithValue }) => {
  try {
    return await getProjectMatches()
  } catch {
    return rejectWithValue('Failed to load project matches.')
  }
})

export const fetchProposals = createAsyncThunk<
  Proposal[],
  void,
  { rejectValue: string }
>('freelance/fetchProposals', async (_, { rejectWithValue }) => {
  try {
    return await getProposals()
  } catch {
    return rejectWithValue('Failed to load proposals.')
  }
})

export const createProposal = createAsyncThunk<
  Proposal,
  CreateProposalPayload,
  { rejectValue: string }
>('freelance/createProposal', async (payload, { rejectWithValue }) => {
  try {
    return await submitProposal(payload)
  } catch {
    return rejectWithValue('Failed to submit proposal.')
  }
})

export const patchProposal = createAsyncThunk<
  Proposal,
  { id: number; payload: PatchProposalPayload },
  { rejectValue: string }
>('freelance/patchProposal', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await updateProposalStatus(id, payload)
  } catch {
    return rejectWithValue('Failed to update proposal.')
  }
})

const freelanceSlice = createSlice({
  name: 'freelance',
  initialState,
  reducers: {
    setProposalTab: (state, action: PayloadAction<ProposalTab>) => {
      state.proposals.activeTab = action.payload
      state.proposals.currentPage = 1
    },
    setProposalPage: (state, action: PayloadAction<number>) => {
      const totalPages = Math.max(
        1,
        Math.ceil(
          state.proposals.items.filter(
            (proposal) =>
              state.proposals.activeTab === 'All Proposals' ||
              proposal.status === state.proposals.activeTab
          ).length / PROPOSAL_PAGE_SIZE
        )
      )
      state.proposals.currentPage = Math.max(1, Math.min(totalPages, action.payload))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectMatches.pending, (state) => {
        state.projects.isLoading = true
        state.projects.error = null
      })
      .addCase(fetchProjectMatches.fulfilled, (state, action) => {
        state.projects.isLoading = false
        state.projects.items = action.payload
      })
      .addCase(fetchProjectMatches.rejected, (state, action) => {
        state.projects.isLoading = false
        if (action.error.name === 'AbortError') {
          return
        }
        state.projects.error = action.payload ?? 'Failed to load project matches.'
      })
      .addCase(fetchProposals.pending, (state) => {
        state.proposals.isLoading = true
        state.proposals.error = null
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.proposals.isLoading = false
        state.proposals.items = action.payload
        const totalPages = Math.max(
          1,
          Math.ceil(action.payload.length / PROPOSAL_PAGE_SIZE)
        )
        state.proposals.currentPage = Math.min(state.proposals.currentPage, totalPages)
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.proposals.isLoading = false
        if (action.error.name === 'AbortError') {
          return
        }
        state.proposals.error = action.payload ?? 'Failed to load proposals.'
      })
      // createProposal
      .addCase(createProposal.fulfilled, (state, action) => {
        // Optimistically prepend the new proposal
        state.proposals.items = [action.payload, ...state.proposals.items]
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.proposals.error = action.payload ?? 'Failed to submit proposal.'
      })
      // patchProposal – update in-place
      .addCase(patchProposal.fulfilled, (state, action) => {
        const idx = state.proposals.items.findIndex((p) => p.id === action.payload.id)
        if (idx !== -1) {
          state.proposals.items[idx] = action.payload
        }
      })
      .addCase(patchProposal.rejected, (state, action) => {
        state.proposals.error = action.payload ?? 'Failed to update proposal.'
      })
  },
})

export const { setProposalTab, setProposalPage } = freelanceSlice.actions

export const selectFreelanceState = (state: RootState) => state.freelance
export const selectProjectMatchesState = (state: RootState) => state.freelance.projects
export const selectProposalsState = (state: RootState) => state.freelance.proposals

export const selectFilteredProposals = createSelector(selectProposalsState, (state) =>
  state.activeTab === 'All Proposals'
    ? state.items
    : state.items.filter((proposal) => proposal.status === state.activeTab)
)

export const selectProposalPagination = createSelector(
  selectFilteredProposals,
  selectProposalsState,
  (filteredItems, proposalsState) => {
    const totalItems = filteredItems.length
    const totalPages = Math.ceil(totalItems / PROPOSAL_PAGE_SIZE)
    const startIndex = (proposalsState.currentPage - 1) * PROPOSAL_PAGE_SIZE
    const endIndex = startIndex + PROPOSAL_PAGE_SIZE
    const paginatedItems = filteredItems.slice(startIndex, endIndex)

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      paginatedItems,
      itemsPerPage: PROPOSAL_PAGE_SIZE,
    }
  }
)

export default freelanceSlice.reducer
