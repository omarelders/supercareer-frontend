import React, { useState, useEffect } from 'react'
import { UserPlus, ArrowRight } from 'lucide-react'
import { saveStoredDemoUser, getStoredDemoUser } from '@/demo/demoStorage'
import { DEMO_TOKENS } from '@/demo/demoData'

export default function GoogleOAuthPopup() {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmail, setCustomEmail] = useState('')

  useEffect(() => {
    document.title = 'Sign in – Google accounts'
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

        // Set session in localStorage so it's instantly available in the parent window too
        localStorage.removeItem('demo_logged_out')
        localStorage.setItem('access', DEMO_TOKENS.access)
        localStorage.setItem('refresh', DEMO_TOKENS.refresh)
        localStorage.setItem('user', JSON.stringify(updatedUser))

        // Notify parent window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'GOOGLE_AUTH_SUCCESS',
              user: { name, email },
            },
            '*'
          )
        }

        // Close popup window
        window.close()
      } catch (err) {
        console.error('Error in Google Auth popup:', err)
        window.close()
      }
    }, 700)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customEmail) return
    const name = customName.trim() || customEmail.split('@')[0]
    handleSelectAccount(name, customEmail.trim())
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 select-none text-[#1f1f1f]"
      style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif" }}
    >
      {/* Top Google Linear Progress Bar */}
      {isSigningIn && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#d3e3fd] overflow-hidden z-50">
          <div className="h-full bg-[#0b57d0] animate-pulse w-full" />
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[440px] mx-auto">
        {/* Google Logo */}
        <div className="mb-4">
          <svg className="h-6 w-auto" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.24 10.87v3.25h5.18c-.2 1.35-1.57 3.96-5.18 3.96-3.12 0-5.67-2.58-5.67-5.76s2.55-5.76 5.67-5.76c1.78 0 2.97.76 3.65 1.41l2.57-2.47C13.82 3.96 11.75 3 9.24 3 4.29 3 .25 7.04.25 12s4.04 9 8.99 9c5.18 0 8.62-3.64 8.62-8.77 0-.59-.06-1.04-.14-1.36H9.24z" fill="#4285F4"/>
            <path d="M26.22 12.38c0-3.32-2.52-5.73-5.66-5.73s-5.66 2.41-5.66 5.73c0 3.29 2.52 5.73 5.66 5.73s5.66-2.44 5.66-5.73zm-2.48 0c0 2.09-1.48 3.52-3.18 3.52-1.7 0-3.18-1.43-3.18-3.52 0-2.11 1.48-3.54 3.18-3.54 1.7 0 3.18 1.43 3.18 3.54z" fill="#EA4335"/>
            <path d="M38.64 12.38c0-3.32-2.52-5.73-5.66-5.73s-5.66 2.41-5.66 5.73c0 3.29 2.52 5.73 5.66 5.73s5.66-2.44 5.66-5.73zm-2.48 0c0 2.09-1.48 3.52-3.18 3.52-1.7 0-3.18-1.43-3.18-3.52 0-2.11 1.48-3.54 3.18-3.54 1.7 0 3.18 1.43 3.18 3.54z" fill="#FBBC05"/>
            <path d="M50.48 7.02v1.07h-.09c-.58-.69-1.68-1.3-3.08-1.3-2.93 0-5.59 2.56-5.59 5.75 0 3.17 2.66 5.73 5.59 5.73 1.4 0 2.5-.61 3.08-1.32h.09v.82c0 2.18-1.17 3.36-3.05 3.36-1.53 0-2.48-1.1-2.87-2.02l-2.16.9c.63 1.51 2.29 3.33 5.03 3.33 2.92 0 5.4-1.72 5.4-5.99V6.99h-2.35v.03zm-2.92 9.07c-1.68 0-3.05-1.43-3.05-3.52 0-2.11 1.37-3.54 3.05-3.54 1.66 0 2.96 1.45 2.96 3.54 0 2.07-1.3 3.52-2.96 3.52z" fill="#4285F4"/>
            <path d="M54.51 3.5h2.46v14.49h-2.46V3.5z" fill="#34A853"/>
            <path d="M66.42 14.54l1.93 1.29c-.63.93-2.13 2.55-4.73 2.55-3.23 0-5.64-2.51-5.64-5.73 0-3.41 2.45-5.73 5.37-5.73 2.94 0 4.38 2.37 4.85 3.65l.27.7-7.64 3.16c.59 1.16 1.51 1.75 2.81 1.75 1.3 0 2.19-.64 2.78-1.64zm-5.79-2.35l5.1-2.12c-.29-.73-1.14-1.24-2.17-1.24-1.31 0-3.14 1.16-2.93 3.36z" fill="#EA4335"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-[24px] font-normal leading-[32px] text-[#1f1f1f]">
          Choose an account
        </h1>
        <p className="text-[16px] font-normal leading-[24px] text-[#444746] mt-1 mb-6">
          to continue to <span className="font-medium text-[#1f1f1f]">Super Career AI</span>
        </p>

        {/* Account List Container (Google Material Design Outlined Box) */}
        <div className="border border-[#c4c7c5] rounded-xl divide-y divide-[#e0e2ec] overflow-hidden mb-6 bg-white">
          {/* Omar Elders Account Item */}
          <div
            onClick={() => !isSigningIn && handleSelectAccount('Omar Elders', 'omar.elders@gmail.com')}
            className="flex items-center gap-3.5 px-4 py-3 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-medium text-sm shrink-0">
              O
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium leading-[20px] text-[#1f1f1f] truncate">
                Omar Elders
              </div>
              <div className="text-[12px] font-normal leading-[16px] text-[#444746] truncate">
                omar.elders@gmail.com
              </div>
            </div>
            {selectedEmail === 'omar.elders@gmail.com' && isSigningIn && (
              <div className="w-4 h-4 border-2 border-[#0b57d0] border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>

          {/* Use Another Account */}
          {!customMode ? (
            <div
              onClick={() => !isSigningIn && setCustomMode(true)}
              className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer hover:bg-[#f8f9fa] transition-colors"
            >
              <div className="w-8 h-8 rounded-full border border-[#747775] text-[#444746] flex items-center justify-center shrink-0">
                <UserPlus size={15} />
              </div>
              <div className="flex-1 min-w-0 text-[14px] font-medium leading-[20px] text-[#1f1f1f]">
                Use another account
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-4 bg-[#f8f9fa] space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#444746] mb-1">Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#c4c7c5] rounded-md focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#444746] mb-1">Google Email *</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-[#c4c7c5] rounded-md focus:outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="text-xs text-[#0b57d0] hover:underline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customEmail || isSigningIn}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSigningIn ? 'Signing in…' : 'Continue'} <ArrowRight size={12} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Disclaimer Note */}
        <p className="text-[12px] font-normal leading-[16px] text-[#444746]">
          To continue, Google will share your name, email address, language preference, and profile picture with Super Career AI. Before using this app, you can review Super Career AI’s{' '}
          <span className="text-[#0b57d0] hover:underline cursor-pointer">privacy policy</span> and{' '}
          <span className="text-[#0b57d0] hover:underline cursor-pointer">terms of service</span>.
        </p>
      </div>

      {/* Footer */}
      <div className="w-full max-w-[440px] mx-auto pt-6 flex items-center justify-between text-[12px] text-[#444746]">
        <div className="flex items-center gap-1 cursor-pointer hover:text-[#1f1f1f]">
          <span>English (United States)</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
            <path d="M0 0.5L5 5.5L10 0.5H0Z" />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <span className="cursor-pointer hover:text-[#1f1f1f]">Help</span>
          <span className="cursor-pointer hover:text-[#1f1f1f]">Privacy</span>
          <span className="cursor-pointer hover:text-[#1f1f1f]">Terms</span>
        </div>
      </div>
    </div>
  )
}
