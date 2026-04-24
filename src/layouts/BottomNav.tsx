import { NavLink } from 'react-router-dom'
import { Briefcase, ClipboardList, FileText, Home, Settings } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'JOPS', icon: Briefcase, href: ROUTES.jobs.jobMatch },
  { label: 'Projects', icon: ClipboardList, href: ROUTES.freelance.projectMatch },
  { label: 'CV', icon: FileText, href: ROUTES.jobs.customCv },
  { label: 'Settings', icon: Settings, href: ROUTES.settings.profile },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.label}
          to={item.href}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
