import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bell, Briefcase, Clock, Search, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '@/components/Logo'
import { useAuth } from '@/context/AuthContext'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProjectMatches,
  selectProjectMatchesState,
  selectRecentProjects,
} from '@/store/slices/freelanceSlice'

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
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState('')
  const [bellOpen, setBellOpen] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const { isLoading } = useAppSelector(selectProjectMatchesState)
  const recentProjects = useAppSelector(selectRecentProjects)

  const displayName =
    (user?.full_name as string | undefined) ??
    (user?.username as string | undefined) ??
    (user?.email as string | undefined) ??
    'Alex M.'

  // Fetch projects once so the bell has data even if the user hasn't visited the page
  useEffect(() => {
    dispatch(fetchProjectMatches())
  }, [dispatch])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleBellClick() {
    setBellOpen((v) => !v)
    if (!bellOpen) setHasViewed(true)
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      navigate(`/freelance/project-match?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/freelance/project-match')
    }
  }

  const showBadge = !hasViewed && recentProjects.length > 0

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-slate-200">
      <div className="flex md:hidden items-center">
        <Logo className="" />
      </div>

      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm shadow-sm w-64 ml-auto transition-colors focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 hover:border-slate-200"
      >
        <button type="submit" className="shrink-0 text-slate-400 hover:text-blue-500 transition-colors">
          <Search size={17} />
        </button>
        <input
          id="top-nav-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm"
        />
      </form>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div ref={bellRef} className="relative hidden md:block">
          <button
            id="top-nav-notifications"
            aria-label="Notifications"
            onClick={handleBellClick}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Bell size={18} />
            {showBadge && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Dropdown */}
          {bellOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ animation: 'notif-drop 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
            >
              <style>{`
                @keyframes notif-drop {
                  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-blue-500" />
                  <span className="text-sm font-bold text-slate-800">Latest Projects</span>
                </div>
                <Link
                  to="/freelance/project-match"
                  onClick={() => setBellOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {/* Content */}
              <div className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 flex gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-2 pt-0.5">
                        <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : recentProjects.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    No projects yet
                  </div>
                ) : (
                  recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/freelance/projects/${project.id}`}
                      onClick={() => setBellOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Briefcase size={15} className="text-blue-500" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{project.client}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Zap size={9} className="fill-blue-600" />
                            {project.matchPct}%
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} />
                            {project.postedTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                <Link
                  to="/freelance/project-match"
                  onClick={() => setBellOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Search size={11} />
                  Browse all project matches
                </Link>
              </div>
            </div>
          )}
        </div>

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
