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
 *
 * NOTE: The AI service (port 8080) does not use JWT authentication,
 * so no Authorization header is attached to these requests.
 */
import axios from 'axios'

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  // AI responses can take a while — allow up to 60 seconds before giving up
  timeout: 60_000,
})

// Attach access token to AI requests in case the backend/gateway requires it for external traffic
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

// Produce a clear, user-friendly message on timeout or network failure
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new Error('The AI is taking too long to respond. Please try again.'))
    }
    if (!error.response) {
      return Promise.reject(new Error('Unable to reach the AI service. Please check your connection.'))
    }
    return Promise.reject(error)
  },
)

export default aiApi

