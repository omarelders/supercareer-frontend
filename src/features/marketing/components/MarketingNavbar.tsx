import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { ROUTES } from '@/config/routes'

export default function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-muted h-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-8 flex items-center justify-between">
        <Link to={ROUTES.home}>
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground font-heading">
          <Link to={ROUTES.home} className="hover:text-primary transition-colors">Find Work</Link>
          <Link to={ROUTES.home} className="hover:text-primary transition-colors">Hire Freelancers</Link>
          <Link to={ROUTES.home} className="hover:text-primary transition-colors">About</Link>
        </nav>

        <Link
          to={ROUTES.login}
          className="bg-primary text-white text-base font-bold px-7 py-4 rounded-full hover:bg-blue-700 transition-colors h-12 flex items-center justify-center tracking-wide font-heading min-w-28"
        >
          Login
        </Link>
      </div>
    </header>
  )
}
