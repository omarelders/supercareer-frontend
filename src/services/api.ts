import axios from 'axios'

let _forceLogoutHandler: (() => void) | null = null

export function setForceLogoutHandler(handler: () => void) {
  _forceLogoutHandler = handler
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Endpoints that never need an auth token and must never trigger a refresh.
const PUBLIC_PATHS = [
  '/api/login/',
  '/api/register/',
  '/api/token/refresh/',
  '/api/auth/google/',
]

function isPublicPath(url?: string): boolean {
  if (!url) return false
  return PUBLIC_PATHS.some((p) => url.includes(p))
}

// ---------------------------------------------------------------------------
// Request interceptor – attach access token (skip for public paths)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    if (!isPublicPath(config.url)) {
      const token = localStorage.getItem('access')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ---------------------------------------------------------------------------
// Response interceptor – silent token refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401s that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Never try to refresh when a public/auth endpoint itself returns 401
    // (e.g. wrong credentials on /api/login/, bad token on /api/token/refresh/).
    // Pass the error straight through so the calling code can handle it.
    if (isPublicPath(originalRequest.url)) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue subsequent 401s while a refresh is in-flight
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refresh = localStorage.getItem('refresh')

    if (!refresh) {
      // No refresh token available – force logout
      forceLogout()
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/token/refresh/`,
        { refresh },
      )

      const newAccess: string = data.access
      const newRefresh: string = data.refresh ?? refresh

      localStorage.setItem('access', newAccess)
      localStorage.setItem('refresh', newRefresh)

      api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
      originalRequest.headers['Authorization'] = `Bearer ${newAccess}`

      processQueue(null, newAccess)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ---------------------------------------------------------------------------
function forceLogout() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
  delete api.defaults.headers.common['Authorization']

  if (_forceLogoutHandler) {
    _forceLogoutHandler()
  } else {
    window.location.href = '/login'
  }
}

export default api
