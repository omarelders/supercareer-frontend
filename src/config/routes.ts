export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  resetSuccess: '/reset-success',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  jobs: {
    jobMatch: '/jobs/job-match',
    customCv: '/jobs/custom-cv',
  },
  freelance: {
    projectMatch: '/freelance/project-match',
    proposal: '/freelance/proposal',
  },
  cvBuilder: '/cv-builder',
  notifications: '/notifications',
  settings: {
    profile: '/settings/profile',
    preferences: '/settings/preferences',
    security: '/settings/security',
  },
} as const
