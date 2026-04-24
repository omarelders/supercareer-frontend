import { Bell, Search, Settings, Menu } from 'lucide-react'
import Logo from '@/components/Logo'

export default function TopNav() {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200">
      <div className="flex md:hidden items-center gap-3">
        <button className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <Logo className="" />
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-400 w-56 cursor-text hover:bg-slate-200 transition-colors mr-auto">
        <Search size={14} />
        <span>Search…</span>
      </div>

      <div className="flex items-center gap-3">

      <button
        id="top-nav-bell"
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell size={17} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
      </button>

      <button
        id="top-nav-settings"
        aria-label="Settings"
        className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Settings size={17} />
      </button>

      <img
        src="https://i.pravatar.cc/40?img=33"
        alt="Alex Morgan"
        className="w-8 h-8 md:w-8 md:h-8 rounded-full object-cover cursor-pointer"
      />
      </div>
    </header>
  )
}
