import React, { useState } from 'react'
import { X, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { saveStoredDemoUser, getStoredDemoUser } from '@/demo/demoStorage'

interface GoogleAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const { googleAuth } = useAuth()
  const navigate = useNavigate()

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')

  if (!isOpen) return null

  const handleSelectAccount = async (name: string, email: string) => {
    setSelectedEmail(email)
    setIsSigningIn(true)

    // Simulate authentic Google OAuth network latency
    setTimeout(async () => {
      try {
        const currentUser = getStoredDemoUser()
        saveStoredDemoUser({
          ...currentUser,
          full_name: name,
          email: email,
          username: email.split('@')[0],
        })

        await googleAuth({
          id_token: 'mock-google-id-token-' + Date.now(),
          role: currentUser.role || 'job_seeker',
        })

        onClose()
        navigate('/dashboard', { replace: true })
      } catch (err) {
        console.error('Google sign in error:', err)
        setIsSigningIn(false)
      }
    }, 750)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail) return
    const name = customName.trim() || customEmail.split('@')[0]
    handleSelectAccount(name, customEmail.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-110 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{ fontFamily: "'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, sans-serif" }}
      >
        {/* Animated Google Linear Progress Bar */}
        {isSigningIn && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20">
            <div className="h-full bg-blue-600 animate-pulse w-full transition-all duration-700" />
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningIn}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          {/* Google Wordmark Logo */}
          <div className="flex justify-center mb-4">
            <svg className="h-7 w-auto" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.24 10.87v3.25h5.18c-.2 1.35-1.57 3.96-5.18 3.96-3.12 0-5.67-2.58-5.67-5.76s2.55-5.76 5.67-5.76c1.78 0 2.97.76 3.65 1.41l2.57-2.47C13.82 3.96 11.75 3 9.24 3 4.29 3 .25 7.04.25 12s4.04 9 8.99 9c5.18 0 8.62-3.64 8.62-8.77 0-.59-.06-1.04-.14-1.36H9.24z" fill="#4285F4"/>
              <path d="M26.22 12.38c0-3.32-2.52-5.73-5.66-5.73s-5.66 2.41-5.66 5.73c0 3.29 2.52 5.73 5.66 5.73s5.66-2.44 5.66-5.73zm-2.48 0c0 2.09-1.48 3.52-3.18 3.52-1.7 0-3.18-1.43-3.18-3.52 0-2.11 1.48-3.54 3.18-3.54 1.7 0 3.18 1.43 3.18 3.54z" fill="#EA4335"/>
              <path d="M38.64 12.38c0-3.32-2.52-5.73-5.66-5.73s-5.66 2.41-5.66 5.73c0 3.29 2.52 5.73 5.66 5.73s5.66-2.44 5.66-5.73zm-2.48 0c0 2.09-1.48 3.52-3.18 3.52-1.7 0-3.18-1.43-3.18-3.52 0-2.11 1.48-3.54 3.18-3.54 1.7 0 3.18 1.43 3.18 3.54z" fill="#FBBC05"/>
              <path d="M50.48 7.02v1.07h-.09c-.58-.69-1.68-1.3-3.08-1.3-2.93 0-5.59 2.56-5.59 5.75 0 3.17 2.66 5.73 5.59 5.73 1.4 0 2.5-.61 3.08-1.32h.09v.82c0 2.18-1.17 3.36-3.05 3.36-1.53 0-2.48-1.1-2.87-2.02l-2.16.9c.63 1.51 2.29 3.33 5.03 3.33 2.92 0 5.4-1.72 5.4-5.99V6.99h-2.35v.03zm-2.92 9.07c-1.68 0-3.05-1.43-3.05-3.52 0-2.11 1.37-3.54 3.05-3.54 1.66 0 2.96 1.45 2.96 3.54 0 2.07-1.3 3.52-2.96 3.52z" fill="#4285F4"/>
              <path d="M54.51 3.5h2.46v14.49h-2.46V3.5z" fill="#34A853"/>
              <path d="M66.42 14.54l1.93 1.29c-.63.93-2.13 2.55-4.73 2.55-3.23 0-5.64-2.51-5.64-5.73 0-3.41 2.45-5.73 5.37-5.73 2.94 0 4.38 2.37 4.85 3.65l.27.7-7.64 3.16c.59 1.16 1.51 1.75 2.81 1.75 1.3 0 2.19-.64 2.78-1.64zm-5.79-2.35l5.1-2.12c-.29-.73-1.14-1.24-2.17-1.24-1.31 0-3.14 1.16-2.93 3.36z" fill="#EA4335"/>
            </svg>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-normal text-slate-800 tracking-tight">Choose an account</h2>
            <p className="text-sm text-slate-500 mt-1">
              to continue to <span className="font-semibold text-slate-800">Super Career AI</span>
            </p>
          </div>

          {/* Account Chooser Card / List */}
          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden mb-6">
            {/* Account 1: Omar Elders (Default) */}
            <button
              type="button"
              disabled={isSigningIn}
              onClick={() => handleSelectAccount('Omar Elders', 'omar.elders@gmail.com')}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-60"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate">Omar Elders</p>
                  <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Default</span>
                </div>
                <p className="text-xs text-slate-500 truncate">omar.elders@gmail.com</p>
              </div>
              {selectedEmail === 'omar.elders@gmail.com' && isSigningIn ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Account 2: Custom Account Option */}
            {!customMode ? (
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => setCustomMode(true)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer group disabled:opacity-60"
              >
                <div className="w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-500 flex items-center justify-center shrink-0 group-hover:border-slate-400 transition-colors">
                  <UserPlus size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Use another account</p>
                  <p className="text-xs text-slate-400">Sign in with any custom Google account</p>
                </div>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-50/70 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. John Client"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Google Email *</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customEmail || isSigningIn}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSigningIn ? 'Signing in…' : 'Continue'} <ArrowRight size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Google Disclaimer */}
          <div className="text-[12px] text-slate-500 leading-relaxed space-y-2 border-t border-slate-100 pt-4">
            <p className="flex items-start gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                To continue, Google will share your name, email address, language preference, and profile picture with <strong>Super Career AI</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>English (United States)</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Help</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
