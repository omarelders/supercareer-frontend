import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/context/AuthContext'

export default function MarketingNavbar() {
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Find Work', href: ROUTES.home },
    { label: 'Hire Freelancers', href: ROUTES.home },
    { label: 'About', href: ROUTES.home },
  ]

  return (
    <header className="sticky top-0 z-50 bg-muted">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 h-20 flex items-center justify-between">
        <Link to={ROUTES.home}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground font-heading">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? ROUTES.dashboard : ROUTES.login}
            className="bg-primary text-white text-base font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center tracking-wide font-heading"
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-muted border-t border-slate-200 px-6 py-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-foreground hover:text-primary py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
