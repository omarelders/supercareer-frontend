import { Bell, Menu, Search } from 'lucide-react'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'

function getInitials(name: string): string {
  const words = name.trim().split(/[\s@._-]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getShortName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0]} ${words[1][0]}.`
  return name
}

export default function TopNav() {
  const { user } = useAuth()

  const displayName =
    (user?.full_name as string | undefined) ??
    (user?.username as string | undefined) ??
    (user?.email as string | undefined) ??
    'Alex M.'

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200">
      <div className="flex md:hidden items-center gap-3">
        <button className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
          <Menu size={20} />
        </button>
        <Logo className="" />
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm text-slate-400 shadow-sm w-64 cursor-text transition-colors hover:border-slate-200 ml-auto">
        <Search size={17} className="text-slate-400" />
        <span>Search projects...</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          id="top-nav-notifications"
          aria-label="Notifications"
          className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 md:flex"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(displayName)
            )}
          </div>
          <span className="hidden max-w-24 truncate text-sm font-semibold text-slate-700 sm:block">
            {getShortName(displayName)}
          </span>
        </div>
      </div>
    </header>
  )
}
