/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setForceLogoutHandler } from '@/services/api'
import { 
  initializeAuth, 
  loginThunk, 
  googleAuthThunk, 
  logoutThunk, 
  updateUser, 
  forceLogoutAction,
  selectIsAuthenticated, 
  selectUser, 
  selectLoading, 
  type AuthUser 
} from '@/store/slices/authSlice'
import type { AppDispatch } from '@/store/store'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleAuth: (params: { id_token: string, role?: string, register?: boolean }) => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)

  useEffect(() => {
    dispatch(initializeAuth())

    setForceLogoutHandler(() => {
      dispatch(forceLogoutAction())
    })
  }, [dispatch])

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated,
    login: async (email, password) => {
      await dispatch(loginThunk({ email, password })).unwrap()
    },
    logout: async () => {
      await dispatch(logoutThunk()).unwrap()
    },
    googleAuth: async (params) => {
      await dispatch(googleAuthThunk(params)).unwrap()
    },
    updateUser: (updates) => {
      dispatch(updateUser(updates))
    },
  }

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
