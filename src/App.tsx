import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ROUTES } from '@/config/routes'
import LoginPage from '@/features/auth/LoginPage'
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage'
import RegisterPage from '@/features/auth/RegisterPage'
import ResetPasswordPage from '@/features/auth/ResetPasswordPage'
import ResetSuccessPage from '@/features/auth/ResetSuccessPage'
import VerifyEmailPage from '@/features/auth/VerifyEmailPage'
import CVBuilderPage from '@/features/cv-builder/CVBuilderPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProjectMatchPage from '@/features/freelance/ProjectMatchPage'
import ProposalPage from '@/features/freelance/ProposalPage'
import CustomCVPage from '@/features/jobs/CustomCVPage'
import JobMatchPage from '@/features/jobs/JobMatchPage'
import MarketingPage from '@/features/marketing/MarketingPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import PreferencesPage from '@/features/settings/PreferencesPage'
import ProfilePage from '@/features/settings/ProfilePage'
import SecurityPage from '@/features/settings/SecurityPage'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import { store } from '@/store/store'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.home} element={<MarketingPage />} />

          <Route element={<AuthLayout />}>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
            <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
            <Route path={ROUTES.resetSuccess} element={<ResetSuccessPage />} />
            <Route path={ROUTES.verifyEmail} element={<VerifyEmailPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path={ROUTES.dashboard} element={<DashboardPage />} />
              <Route path={ROUTES.jobs.jobMatch} element={<JobMatchPage />} />
              <Route path={ROUTES.jobs.customCv} element={<CustomCVPage />} />
              <Route path={ROUTES.freelance.projectMatch} element={<ProjectMatchPage />} />
              <Route path={ROUTES.freelance.proposal} element={<ProposalPage />} />
              <Route path={ROUTES.cvBuilder} element={<CVBuilderPage />} />
              <Route path={ROUTES.notifications} element={<NotificationsPage />} />
              <Route path={ROUTES.settings.profile} element={<ProfilePage />} />
              <Route path={ROUTES.settings.preferences} element={<PreferencesPage />} />
              <Route path={ROUTES.settings.security} element={<SecurityPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
