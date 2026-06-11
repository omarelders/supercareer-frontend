import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { X, LogOut, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import Logo from '../components/Logo'
import { useAuth } from '@/context/AuthContext'
import {
  MAIN_NAV_ITEMS,
  SETTINGS_NAV_ITEMS,
  isLeafNavigationItem,
  type LeafNavigationItem,
  type NavigationItem,
} from '@/config/navigation'

// ---------------------------------------------------------------------------
// Leaf link
// ---------------------------------------------------------------------------
function DrawerLeafLink({ item, onClose }: { item: LeafNavigationItem; onClose: () => void }) {
  return (
    <NavLink
      to={item.href}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center pl-10 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'text-blue-600 font-semibold bg-blue-50'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`
      }
    >
      <span>{item.label}</span>
    </NavLink>
  )
}

// ---------------------------------------------------------------------------
// Section item (top-level link or expandable group)
// ---------------------------------------------------------------------------
function DrawerSection({ item, onClose }: { item: NavigationItem; onClose: () => void }) {
  const location = useLocation()
  const isChildActive = item.children?.some((c) => location.pathname === c.href)
  const [open, setOpen] = useState(isChildActive ?? true)

  if (item.href) {
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`
        }
      >
        {item.icon && <item.icon size={18} className="shrink-0" />}
        <span className="flex-1">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        {item.icon && <item.icon size={18} className="shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {item.children?.filter(isLeafNavigationItem).map((child) => (
            <DrawerLeafLink key={child.label} item={child} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name: string): string {
  const words = name.trim().split(/[\s@._-]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ---------------------------------------------------------------------------
// Main drawer
// ---------------------------------------------------------------------------
interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { user, logout } = useAuth()

  const displayName =
    (user?.full_name as string | undefined) ??
    (user?.username as string | undefined) ??
    (user?.email as string | undefined) ??
    'User'

  const role = (user?.role as string | undefined) ?? 'Member'
  const initials = getInitials(displayName)

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {MAIN_NAV_ITEMS.map((item) => (
            <DrawerSection key={item.label} item={item} onClose={onClose} />
          ))}

          <div className="pt-4 pb-1">
            <p className="px-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
              Settings
            </p>
          </div>

          {SETTINGS_NAV_ITEMS.map((item) => (
            <DrawerSection key={item.label} item={item} onClose={onClose} />
          ))}
        </nav>

        {/* Footer: user info + logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.settings.profile}
              onClick={onClose}
              className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar as string} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white leading-none">{initials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{role}</p>
              </div>
            </Link>
            <button
              aria-label="Log out"
              onClick={() => { void logout(); onClose() }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
