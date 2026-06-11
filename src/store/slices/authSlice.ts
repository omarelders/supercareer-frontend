import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store.ts'
import api from '@/services/api'
import { googleLogin as apiGoogleLogin, googleRegister as apiGoogleRegister } from '@/services/googleAuthApi'

export interface AuthUser {
  id?: number | string
  email?: string
  username?: string
  full_name?: string
  role?: string
  avatar?: string
  [key: string]: unknown
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
}

interface LoginResponse {
  tokens: {
    access: string
    refresh: string
  }
  user: AuthUser
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  return payload.exp * 1000 < Date.now() + 10_000
}

function getInitialState(): AuthState {
  try {
    const access = localStorage.getItem('access')
    const stored = localStorage.getItem('user')
    if (access && stored) {
      return { isAuthenticated: true, user: JSON.parse(stored), loading: true }
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false, user: null, loading: true }
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const access = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')

    if (!isTokenExpired(access)) {
      api.defaults.headers.common['Authorization'] = `Bearer ${access!}`
      return { isAuthenticated: true }
    } else if (!isTokenExpired(refresh)) {
      return { isAuthenticated: true }
    } else {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      return { isAuthenticated: false }
    }
  }
)

const persistSession = (access: string, refresh: string, userData: AuthUser) => {
  localStorage.setItem('access', access)
  localStorage.setItem('refresh', refresh)
  localStorage.setItem('user', JSON.stringify(userData))
  api.defaults.headers.common['Authorization'] = `Bearer ${access}`
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: Record<string, string>) => {
    const { data } = await api.post<LoginResponse>('/api/login/', { email, password })
    const access = data.tokens.access
    const refresh = data.tokens.refresh
    const userData = data.user

    if (!access || !refresh) {
      throw new Error('Missing access/refresh tokens.')
    }

    persistSession(access, refresh, userData ?? { email })
    return userData ?? { email }
  }
)

export const googleAuthThunk = createAsyncThunk(
  'auth/googleAuth',
  async ({ id_token, role, register = false }: { id_token: string; role?: string; register?: boolean }) => {
    const response = register
      ? await apiGoogleRegister(id_token, role ?? 'job_seeker')
      : await apiGoogleLogin(id_token, role)
      
    const data = response as unknown as LoginResponse
    const access = data.tokens?.access
    const refresh = data.tokens?.refresh
    const userData = data.user

    if (!access || !refresh) {
      throw new Error('Google auth response is missing tokens.')
    }

    persistSession(access, refresh, userData ?? {})
    return userData ?? {}
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    const refresh = localStorage.getItem('refresh')
    try {
      if (refresh) {
        await api.post('/api/logout/', { refresh })
      }
    } catch {
      // Ignore server errors
    } finally {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    forceLogoutAction: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        if (!action.payload.isAuthenticated) {
          state.isAuthenticated = false
          state.user = null
        } else {
          state.isAuthenticated = true
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(googleAuthThunk.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { updateUser, forceLogoutAction } = authSlice.actions

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectUser = (state: RootState) => state.auth.user
export const selectLoading = (state: RootState) => state.auth.loading

export default authSlice.reducer
