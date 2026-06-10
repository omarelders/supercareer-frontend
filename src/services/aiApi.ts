/**
 * aiApi.ts
 *
 * A dedicated Axios instance for AI-powered endpoints that run on a
 * separate backend service (VITE_AI_API_URL, port 8080).
 *
 * Covers:
 *   POST /api/opportunities/generate-proposal/
 *   POST /API/CV/optimiz/user_interaction
 *   POST /API/CV/optimiz/ATS
 */
import axios from 'axios'

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the JWT access token to every request (same pattern as api.ts)
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export default aiApi
