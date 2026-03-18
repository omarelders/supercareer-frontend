import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store.ts'

interface AuthState {
  isAuthenticated: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated

export default authSlice.reducer
