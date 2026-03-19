import { Outlet, Link, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'

export default function AuthLayout() {
  const location = useLocation()

  let ctaRoute = '/login'
  let ctaText = 'Login'

  if (location.pathname === '/login') {
    ctaRoute = '/register'
    ctaText = 'Sign up'
  } else if (location.pathname === '/reset-success') {
    ctaRoute = '/join'
    ctaText = 'Join now'
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-18 bg-white border-b border-slate-200 flex items-center px-10">
        <Link to="/" className="mr-auto">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-800 font-bold mr-10">
          <Link to="/" className="hover:text-blue-600 transition-colors">Find Work</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">Hire Freelancers</Link>
          <Link to="/" className="hover:text-blue-600 transition-colors">About</Link>
        </nav>

        <Link
          to={ctaRoute}
          className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
        >
          {ctaText}
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <Outlet />
      </main>

      <footer className="h-15 bg-slate-50 flex items-center justify-between px-10 text-xs text-slate-500 border-t border-slate-200">
        <span>© 2026 Super Career. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-slate-800 transition-colors">Privacy</Link>
          <Link to="/" className="hover:text-slate-800 transition-colors">Terms</Link>
          <Link to="/" className="hover:text-slate-800 transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  )
}
