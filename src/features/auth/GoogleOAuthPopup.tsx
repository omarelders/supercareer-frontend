import React, { useState, useEffect } from 'react'
import { User, ArrowRight, Zap } from 'lucide-react'
import { saveStoredDemoUser, getStoredDemoUser } from '@/demo/demoStorage'
import { DEMO_TOKENS } from '@/demo/demoData'

interface GoogleAccountItem {
  id: string
  name: string
  email: string
  avatarType: 'image' | 'letter'
  avatarBg?: string
  avatarText?: string
  avatarImg?: string
}

const ACCOUNTS: GoogleAccountItem[] = [
  {
    id: 'omar-1',
    name: 'Omar Elders',
    email: 'omarelders1968@gmail.com',
    avatarType: 'image',
    avatarImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 'omar-2',
    name: 'omar elders',
    email: 'omarelders25@gmail.com',
    avatarType: 'image',
    avatarImg: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=face',
  },
  {
    id: 'omar-3',
    name: 'omar elders',
    email: 'omarelders.dev@gmail.com',
    avatarType: 'letter',
    avatarBg: '#5f6368',
    avatarText: 'o',
  },
  {
    id: 'ali-1',
    name: 'ali eldeeb',
    email: 'alieldeeb1244@gmail.com',
    avatarType: 'letter',
    avatarBg: '#e34426',
    avatarText: 'a',
  },
]

export default function GoogleOAuthPopup() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')

  useEffect(() => {
    document.title = 'Sign in - Google Accounts'
  }, [])

  const handleSelectAccount = (name: string, email: string) => {
    setSelectedEmail(email)
    setIsSigningIn(true)

    setTimeout(() => {
      try {
        const currentUser = getStoredDemoUser()
        const updatedUser = {
          ...currentUser,
          full_name: name,
          email: email,
          username: email.split('@')[0],
        }
        saveStoredDemoUser(updatedUser)

        localStorage.removeItem('demo_logged_out')
        localStorage.setItem('access', DEMO_TOKENS.access)
        localStorage.setItem('refresh', DEMO_TOKENS.refresh)
        localStorage.setItem('user', JSON.stringify(updatedUser))

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_SUCCESS',
              user: { name, email },
            },
            '*'
          )
        }

        window.close()
      } catch (err) {
        console.error('Error in Google Auth popup:', err)
        window.close()
      }
    }, 650)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail) return
    const name = customName.trim() || customEmail.split('@')[0]
    handleSelectAccount(name, customEmail.trim())
  }

  return (
    <div 
      className="min-h-screen bg-[#131314] text-[#e3e3e3] flex flex-col justify-between select-none"
      style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}
    >
      {/* Top Google Loading Bar */}
      {isSigningIn && (
        <div className="h-1 bg-[#1a73e8]/20 overflow-hidden shrink-0">
          <div className="h-full bg-[#8ab4f8] animate-pulse w-full" />
        </div>
      )}

      {/* Content Container */}
      <div className="flex-1 max-w-[440px] w-full mx-auto px-6 pt-6 pb-4 flex flex-col justify-between">
        <div>
          {/* Header with Google G logo & "Sign in with Google" */}
          <div className="flex items-center gap-3 mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[15px] font-medium text-[#e3e3e3]">Sign in with Google</span>
          </div>

          {/* Super Career AI App Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm mb-4">
            <Zap size={24} className="fill-white text-white" />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-[32px] font-normal text-[#e3e3e3] leading-tight tracking-tight">
            Choose an account
          </h1>
          <p className="text-[15px] text-[#e3e3e3] mt-2 mb-6">
            to continue to <span className="text-[#8ab4f8] font-medium">Super Career AI</span>
          </p>

          {/* Accounts List */}
          <div className="space-y-0.5">
            {ACCOUNTS.map((acc) => (
              <div key={acc.id} className="border-b border-[#3c4043] last:border-b-0">
                <div
                  onClick={() => !isSigningIn && handleSelectAccount(acc.name, acc.email)}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-2xl cursor-pointer hover:bg-[#282a2c] transition-colors -mx-1.5"
                >
                  {/* Avatar */}
                  {acc.avatarType === 'image' && acc.avatarImg ? (
                    <img
                      src={acc.avatarImg}
                      alt={acc.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#5f6368]"
                    />
                  ) : (
                    <div
                      style={{ backgroundColor: acc.avatarBg || '#5f6368' }}
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-medium text-sm shrink-0"
                    >
                      {acc.avatarText}
                    </div>
                  )}

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium leading-[20px] text-[#e3e3e3] truncate">
                      {acc.name}
                    </div>
                    <div className="text-[13px] font-normal leading-[16px] text-[#9aa0a6] truncate">
                      {acc.email}
                    </div>
                  </div>

                  {/* Loading Spinner */}
                  {selectedEmail === acc.email && isSigningIn && (
                    <div className="w-4 h-4 border-2 border-[#8ab4f8] border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                </div>
              </div>
            ))}

            {/* Use Another Account Row */}
            <div className="border-t border-[#3c4043] pt-0.5">
              {!customMode ? (
                <div
                  onClick={() => !isSigningIn && setCustomMode(true)}
                  className="flex items-center gap-3.5 px-3 py-3 rounded-2xl cursor-pointer hover:bg-[#282a2c] transition-colors -mx-1.5"
                >
                  <div className="w-8 h-8 rounded-full border border-[#5f6368] text-[#e3e3e3] flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0 text-[15px] font-medium text-[#e3e3e3]">
                    Use another account
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="p-4 bg-[#1e1f20] rounded-xl space-y-3 mt-2 border border-[#3c4043]">
                  <div>
                    <label className="block text-[11px] font-medium text-[#9aa0a6] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-1.5 text-sm bg-[#131314] text-[#e3e3e3] border border-[#3c4043] rounded-md focus:outline-none focus:border-[#8ab4f8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#9aa0a6] mb-1">Google Email *</label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-3 py-1.5 text-sm bg-[#131314] text-[#e3e3e3] border border-[#3c4043] rounded-md focus:outline-none focus:border-[#8ab4f8]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomMode(false)}
                      className="text-xs text-[#8ab4f8] hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customEmail || isSigningIn}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8ab4f8] hover:bg-[#a8c7fa] text-[#131314] text-xs font-semibold rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isSigningIn ? 'Signing in…' : 'Continue'} <ArrowRight size={12} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Disclaimer text */}
          <p className="text-[13px] text-[#9aa0a6] leading-relaxed mt-7 mb-4">
            Before using this app, you can review Super Career AI's{' '}
            <span className="text-[#8ab4f8] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
            <span className="text-[#8ab4f8] hover:underline cursor-pointer">Terms of Service</span>.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[12px] text-[#9aa0a6] pt-4 border-t border-[#2d2f31]">
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#e3e3e3]">
            <span>English (United States)</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
              <path d="M0 0.5L5 5.5L10 0.5H0Z" />
            </svg>
          </div>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-[#e3e3e3]">Help</span>
            <span className="cursor-pointer hover:text-[#e3e3e3]">Privacy</span>
            <span className="cursor-pointer hover:text-[#e3e3e3]">Terms</span>
          </div>
        </div>
      </div>
    </div>
  )
}
