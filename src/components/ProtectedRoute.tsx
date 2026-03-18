import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/slices/authSlice'

export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <Outlet />
}
