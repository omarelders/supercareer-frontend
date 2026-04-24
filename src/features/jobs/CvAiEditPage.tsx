import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react'
import { CVPreview } from '@/features/cv-builder/components/CVPreview'
import type { CVData } from '@/features/cv-builder/types'
import { MantineProvider } from '@mantine/core'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Mock CV data that would come from the back-end
const MOCK_CV_DATA: CVData = {
  personal: {
    fullName: 'Abdullah Ahmed',
    title: 'Senior Frontend Developer',
    email: 'abdullah@example.com',
    phone: '+20 100 000 0000',
    location: 'Cairo, Egypt',
    url: 'github.com/abdullah',
    summary:
      'Experienced frontend developer with 6+ years building scalable web applications using React, TypeScript and modern toolchains. Passionate about performance, clean architecture and great UX.',
  },
  experience: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp International',
      startDate: 'Jan 2022',
      endDate: '',
      current: true,
      description:
        'Led migration from Vue 2 to React 18, reducing bundle size by 40%. Architected a design-system used by 6 product teams.',
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'NeoBank Systems',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      current: false,
      description:
        'Built real-time trading dashboards with WebSocket integration, serving 50k+ daily active users.',
    },
  ],
  education: [
    {
      id: '1',
      school: 'Cairo University',
      degree: 'B.Sc. Computer Science',
      year: '2019',
      description: 'Graduated with distinction. Specialized in software engineering.',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Figma', 'AWS', 'Tailwind CSS'],
}

export default function CvAiEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cvData, setCvData] = useState<CVData>(MOCK_CV_DATA)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I'm your AI career assistant. Tell me how you'd like to improve your CV — I can strengthen your summary, tailor it for a specific role, rewrite bullet points, and more.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    try {
      // TODO: replace with real API call
      // const response = await api.post('/API/CV/optimiz/user_interaction', {
      //   cv_id: id,
      //   message: trimmed,
      // })
      // const updatedCv = response.data.cv
      // setCvData(updatedCv)

      // Mock response for now
      await new Promise((r) => setTimeout(r, 1500))
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I've updated your CV based on your request. The changes are reflected in the preview on the left. Feel free to ask for more adjustments!",
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Simulate a small CV update
      setCvData((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          summary: prev.personal.summary + ' ' + '(AI-optimized for ' + trimmed.slice(0, 30) + '…)',
        },
      }))
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
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full">
          <Sparkles size={13} className="text-violet-500" />
          <span className="text-xs font-semibold text-violet-600">AI Powered</span>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-1 gap-5 min-h-0">
        {/* LEFT: CV Preview */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl">
          <MantineProvider
            theme={{
              fontFamily: 'Inter, sans-serif',
              headings: { fontFamily: 'Manrope, sans-serif' },
              primaryColor: 'blue',
            }}
          >
            <CVPreview data={cvData} />
          </MantineProvider>
        </div>

        {/* RIGHT: Chat panel */}
        <div className="w-[380px] flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
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
