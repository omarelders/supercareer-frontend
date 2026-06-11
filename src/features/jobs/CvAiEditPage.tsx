import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2, AlertCircle, RefreshCw, Save, CheckCircle } from 'lucide-react'
import { CVPreview } from '@/features/cv-builder/components/CVPreview'
import type { CVData } from '@/features/cv-builder/types'
import { MantineProvider } from '@mantine/core'
import { cvUserInteraction } from '@/services/cvAiApi'
import { getCvContent, saveCvContent } from '@/services/jobsApi'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_CV: CVData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    url: '',
    summary: '',
  },
  experience: [],
  education: [],
  skills: [],
}

export default function CvAiEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [cvData, setCvData] = useState<CVData>(INITIAL_CV)
  const [cvLoading, setCvLoading] = useState(true)
  const [cvError, setCvError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat')

  const chatStorageKey = `cv_ai_chat_${id}`

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(chatStorageKey)
      if (stored) {
        return JSON.parse(stored) as Message[]
      }
    } catch {
      // ignore parse errors
    }
    return [
      {
        id: '0',
        role: 'assistant',
        content:
          "Hello! I'm your AI career assistant. Tell me how you'd like to improve your CV — I can strengthen your summary, tailor it for a specific role, rewrite bullet points, and more.",
      },
    ]
  })

  // Sync messages to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(chatStorageKey, JSON.stringify(messages))
  }, [messages, chatStorageKey])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ---------------------------------------------------------------------------
  // Fetch CV data on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      setCvError('No CV ID provided.')
      setCvLoading(false)
      return
    }

    let cancelled = false

    async function loadCv() {
      setCvLoading(true)
      setCvError(null)
      try {
        const numericId = Number(id)

        // 1. Try to load previously saved full CV content
        try {
          const stored = await getCvContent(numericId)
          if (stored) {
            if (!cancelled) {
              setCvData(stored)
              setCvLoading(false)
            }
            return
          }
        } catch (err) {
          console.error('Failed to load CV content from backend:', err)
        }

        // 2. No saved content — fall back to profile defaults
        let profileName = ''
        let profileTitle = ''

        try {
          const { data } = await api.get('/api/profile/')
          if (data) {
            profileName =
              data.full_name ||
              [data.first_name, data.last_name].filter(Boolean).join(' ') ||
              data.username ||
              ''
            profileTitle = data.professional_title || ''
          }
        } catch (profileErr) {
          console.error('Failed to load profile for CV defaults:', profileErr)
        }

        // Fallbacks from auth context
        if (!profileName && user) {
          profileName =
            (user.full_name as string) ||
            (user.username as string) ||
            (user.email as string) ||
            ''
        }

        // Import dynamically to avoid circular deps; the slice already has the CVs in localStorage
        const { getCustomCVs } = await import('@/services/jobsApi')
        const cvs = await getCustomCVs()
        const found = cvs.find((cv) => String(cv.id) === String(id))

        if (!found) {
          // CV not found in list – show a placeholder state with a notice
          // The AI interaction will still work because we send the current cvData
          if (!cancelled) {
            setCvData((prev) => ({
              ...prev,
              personal: {
                ...prev.personal,
                fullName: profileName || prev.personal.fullName,
                title: profileTitle || prev.personal.title,
              },
            }))
            setCvError(null)
            setCvLoading(false)
          }
          return
        }

        // The list endpoint only returns metadata (id, title, date…).
        // If the backend exposes a GET /API/CV/{id}/ endpoint in the future,
        // call it here to hydrate the full CVData. For now we surface the
        // metadata we have and let the AI interaction fill in the rest.
        if (!cancelled) {
          setCvData((prev) => ({
            ...prev,
            personal: {
              ...prev.personal,
              fullName: profileName || prev.personal.fullName,
              title: profileTitle || prev.personal.title || found.professional_title,
            },
          }))
          setCvLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setCvError('Failed to load CV data. You can still chat with the AI.')
          setCvLoading(false)
        }
      }
    }

    loadCv()
    return () => {
      cancelled = true
    }
  }, [id, user])

  // ---------------------------------------------------------------------------
  // Auto-scroll on new messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ---------------------------------------------------------------------------
  // Auto-resize textarea
  // ---------------------------------------------------------------------------
  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  // ---------------------------------------------------------------------------
  // Send message → call API → update CV preview
  // ---------------------------------------------------------------------------
  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSendError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    try {
      const { updatedCv, aiMessage } = await cvUserInteraction(cvData, trimmed)

      // Update the live CV preview with the AI-modified version
      setCvData(updatedCv)
      // Persist the AI-updated CV so "Edit Manually" sees the latest version
      if (id) {
        await saveCvContent(Number(id), updatedCv)
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiMessage,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      // Surface the error in the chat rather than crashing
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'

      setSendError(message)

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ I ran into an issue processing your request. ${message} Please try again.`,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ---------------------------------------------------------------------------
  // Manual save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!id || isSaving) return
    setIsSaving(true)
    setSaved(false)
    try {
      await saveCvContent(Number(id), cvData)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Failed to save CV:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full w-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800">Edit with AI</h1>
          <p className="text-xs text-slate-400">CV #{id} — chat with the AI to refine your CV</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || saved || cvLoading}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: saved ? '#10B981' : '#3B82F6',
              color: 'white',
            }}
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle size={14} /> Saved!</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full">
            <Sparkles size={13} className="text-violet-500" />
            <span className="text-xs font-semibold text-violet-600">AI Powered</span>
          </div>
        </div>
      </div>

      {/* CV load error banner */}
      {cvError && (
        <div className="flex items-center gap-2 mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{cvError}</span>
        </div>
      )}

      {/* Mobile tab switcher */}
      <div className="flex lg:hidden border border-slate-200 rounded-xl overflow-hidden mb-4 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'chat'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          📄 Preview CV
        </button>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row flex-1 gap-5 min-h-0">
        {/* LEFT: CV Preview — hidden on mobile unless preview tab is active */}
        <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 min-h-0 overflow-y-auto rounded-xl`}>
          {cvLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm gap-2">
              <Loader2 size={18} className="animate-spin" />
              Loading CV…
            </div>
          ) : (
            <MantineProvider
              theme={{
                fontFamily: 'Inter, sans-serif',
                headings: { fontFamily: 'Manrope, sans-serif' },
                primaryColor: 'blue',
              }}
            >
              <CVPreview data={cvData} />
            </MantineProvider>
          )}
        </div>

        {/* RIGHT: Chat panel */}
        <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[380px] flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden`}>
          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
              <Bot size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Career AI</p>
              <p className="text-xs text-slate-400">Powered by SuperCareer</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                    msg.role === 'assistant' ? 'bg-violet-500' : 'bg-blue-500'
                  }`}
                >
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-slate-100 text-slate-700 rounded-tl-sm'
                      : 'bg-blue-500 text-white rounded-tr-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send error banner */}
          {sendError && (
            <div className="mx-4 mb-2 flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              <AlertCircle size={12} className="flex-shrink-0" />
              <span className="flex-1">{sendError}</span>
              <button
                onClick={() => setSendError(null)}
                className="hover:text-red-800 transition-colors"
                aria-label="Dismiss error"
              >
                <RefreshCw size={11} />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  autoResize()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to improve your CV…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none leading-relaxed"
                style={{ maxHeight: 160 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 mb-0.5"
              >
                {isLoading ? (
                  <Loader2 size={15} className="text-white animate-spin" />
                ) : (
                  <Send size={15} className="text-white" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
