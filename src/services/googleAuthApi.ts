import api from './api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface GoogleAuthPayload {
  id_token: string
  role?: string
}

export interface GoogleAuthResponse {
  access: string
  refresh: string
  user?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/google/login/
 * Exchanges a Google ID token for JWT access/refresh tokens.
 * Use when the user already has an existing account linked to Google.
 */
export async function googleLogin(
  id_token: string,
  role?: string,
): Promise<GoogleAuthResponse> {
  const payload: GoogleAuthPayload = { id_token, ...(role ? { role } : {}) }
  const { data } = await api.post<GoogleAuthResponse>('/api/auth/google/login/', payload)
  return data
}

/**
 * POST /api/auth/google/register/
 * Registers a new account using a Google ID token.
 * Use during the first-time sign-up with Google.
 */
export async function googleRegister(
  id_token: string,
  role: string,
): Promise<GoogleAuthResponse> {
  const { data } = await api.post<GoogleAuthResponse>('/api/auth/google/register/', {
    id_token,
    role,
  })
  return data
}
