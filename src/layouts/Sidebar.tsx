import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import Logo from '../components/Logo'
import {
  MAIN_NAV_ITEMS,
  SETTINGS_NAV_ITEMS,
  isLeafNavigationItem,
  type LeafNavigationItem,
  type NavigationItem,
} from '@/config/navigation'


function LeafLink({ item }: { item: LeafNavigationItem }) {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center justify-between pl-9 pr-3 py-1.5 rounded-lg text-sm transition-colors ${
          isActive
            ? 'text-blue-600 font-medium'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`
      }
    >
      <span>{item.label}</span>
      {item.actionIcon && <span><item.actionIcon size={13} className="text-slate-400" /></span>}
    </NavLink>
  )
}


function NavSection({ item }: { item: NavigationItem }) {
  const location = useLocation()
  const isChildActive = item.children?.some((c) => location.pathname === c.href)
  const [open, setOpen] = useState(isChildActive ?? true)

  if (item.href) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
            isActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`
        }
      >
        <span className="shrink-0">{item.icon && <item.icon size={17} />}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge === 'dot' && (
          <span className="w-2 h-2 rounded-full bg-red-500 absolute right-3 top-2.5" />
        )}
      </NavLink>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <span className="shrink-0">{item.icon && <item.icon size={17} />}</span>
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {item.children?.filter(isLeafNavigationItem).map((child) => (
            <LeafLink key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  )
}


export default function Sidebar() {
  return (
    <aside className="w-50 shrink-0 flex flex-col h-full border-r border-slate-200 bg-white">
      <Logo className="px-4 py-5" />

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavSection key={item.label} item={item} />
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Settings
          </p>
        </div>

        {SETTINGS_NAV_ITEMS.map((item) => (
          <NavSection key={item.label} item={item} />
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-200">
        <div className="flex items-center gap-2.5">
          <img
            src="https://i.pravatar.cc/40?img=33"
            alt="Omar Elders"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Omar Elders</p>
            <p className="text-xs text-slate-400 truncate">Pro Member</p>
          </div>
          <button aria-label="User profile options" className="text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
