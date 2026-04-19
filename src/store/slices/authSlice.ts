import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthState {
  isAuthenticated: boolean
  user: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Initial state – rehydrate from localStorage on page load
// ---------------------------------------------------------------------------
function getInitialState(): AuthState {
  try {
    const access = localStorage.getItem('access')
    const stored = localStorage.getItem('user')
    if (access && stored) {
      return { isAuthenticated: true, user: JSON.parse(stored) }
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false, user: null }
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    /**
     * Call after a successful login to sync Redux with the Auth context.
     */
    login: (state, action: PayloadAction<Record<string, unknown> | undefined>) => {
      state.isAuthenticated = true
      state.user = action.payload ?? null
    },
    /**
     * Call after logout to clear Redux auth state.
     */
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
    },
  },
})

export const { login, logout } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectUser = (state: RootState) => state.auth.user

export default authSlice.reducer
