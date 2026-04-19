import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api, { setForceLogoutHandler } from '@/services/api'
import { googleLogin as apiGoogleLogin, googleRegister as apiGoogleRegister } from '@/services/googleAuthApi'

export interface AuthUser {
  id?: number | string
  email?: string
  username?: string
  full_name?: string
  role?: string
  [key: string]: unknown
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleAuth: (params: {
    id_token: string
    role?: string
    register?: boolean
  }) => Promise<void>
}

// Typing based on the exact shape returned by the backend
interface LoginResponse {
  tokens: {
    access: string
    refresh: string
  }
  user: AuthUser
}

/** Decode a JWT payload without any library – returns null on any failure. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Returns true if the token is missing or its exp is in the past. */
function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return true
  // exp is in seconds; add a 10-second clock-skew buffer
  return payload.exp * 1000 < Date.now() + 10_000
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // loading = true until we've finished the startup token check.
  // ProtectedRoute waits on this before deciding to render or redirect.
  const [loading, setLoading] = useState<boolean>(true)


  useEffect(() => {
    const access = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')

    if (!isTokenExpired(access)) {
      // Valid access token → restore session
      api.defaults.headers.common['Authorization'] = `Bearer ${access!}`
      setIsAuthenticated(true)
    } else if (!isTokenExpired(refresh)) {
      // Access expired but refresh is still valid → will be refreshed on
      // next API call by the response interceptor; treat as authenticated
      // so we don't flash the login screen.
      setIsAuthenticated(true)
    } else {
      // Both expired or missing → clear stale data so the 401 race
      // can never happen (nothing to send to the backend).
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    setForceLogoutHandler(() => {
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
    })
  }, [])

  const persistSession = useCallback(
    (access: string, refresh: string, userData: AuthUser) => {
      // 1. Persist to localStorage (synchronous)
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      localStorage.setItem('user', JSON.stringify(userData))

      // 2. Set the in-memory default header on the Axios instance so that
      //    any request fired during React's batched re-render already has
      //    the token — this is the key fix for the race condition.
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`

      // 3. THEN update React state (batched by React 18)
      setUser(userData)
      setIsAuthenticated(true)
    },
    [],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/api/login/', { email, password })

      const responseData = data as LoginResponse
      const access = responseData.tokens.access
      const refresh = responseData.tokens.refresh
      const userData = responseData.user

      if (!access || !refresh) {
        throw new Error(
          'Missing access/refresh tokens. Backend returned: ' + JSON.stringify(responseData)
        )
      }

      persistSession(access, refresh, userData ?? { email })
    },
    [persistSession],
  )

  const googleAuth = useCallback(
    async ({
      id_token,
      role,
      register = false,
    }: {
      id_token: string
      role?: string
      register?: boolean
    }) => {
      const response = register
        ? await apiGoogleRegister(id_token, role ?? 'job_seeker')
        : await apiGoogleLogin(id_token, role)

      const responseData = response as unknown as LoginResponse
      const access = responseData.tokens.access
      const refresh = responseData.tokens.refresh
      const userData = responseData.user

      if (!access || !refresh) {
        throw new Error(
          'Google auth response is missing access or refresh tokens.',
        )
      }

      persistSession(access, refresh, (userData as AuthUser) ?? {})
    },
    [persistSession],
  )

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh')
    try {
      if (refresh) {
        await api.post('/api/logout/', { refresh })
      }
    } catch {
      // Ignore server errors – always clear local state
    } finally {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      googleAuth,
    }),
    [user, loading, isAuthenticated, login, logout, googleAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}

export default AuthContext
