import { useEffect, useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Plus,
  Settings,
  Trash2,
  User,
} from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

interface ExperienceItem {
  id: number
  job_title: string
  company: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
}

interface EducationItem {
  id: number
  school: string
  degree: string
  graduation_year: string
  description: string
}

interface ProfileResponse {
  id: number
  user: number
  first_name: string
  last_name: string
  email: string
  username: string
  full_name: string
  phone_number: string
  professional_title: string
  location: string
  portfolio_url: string
  bio: string
  specialization: string
  experience: string
  hourly_rate: string
  education: string
  preferences: string
  skills?: string[]
  experiences: ExperienceItem[]
  education_history: EducationItem[]
}

interface ProfileForm {
  email: string
  full_name: string
  professional_title: string
  location: string
  bio: string
}

interface ShowcaseProject {
  id: number
  name: string
  link: string
  description: string
  technologies: string[]
}

const emptyForm: ProfileForm = {
  email: '',
  full_name: '',
  professional_title: '',
  location: '',
  bio: '',
}

const defaultProject: ShowcaseProject = {
  id: 1,
  name: 'AI Marketplace API',
  link: 'https://api.hub.com/docs',
  description: 'High-performance REST API built for handling real-time AI model transactions and usage metering.',
  technologies: ['Node.js', 'PostgreSQL', 'Redis'],
}

function toForm(profile: ProfileResponse): ProfileForm {
  return {
    email: profile.email ?? '',
    full_name: profile.full_name ?? [profile.first_name, profile.last_name].filter(Boolean).join(' '),
    professional_title: profile.professional_title ?? '',
    location: profile.location ?? '',
    bio: profile.bio ?? '',
  }
}

function initialsFrom(name: string, fallback = 'U') {
  const words = name.trim().split(/[\s@._-]+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return (name || fallback).slice(0, 2).toUpperCase()
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  name: keyof ProfileForm
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-2">{label}</span>
      <input
        name={name}
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}

function SettingsHeader() {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 px-4 py-5 md:px-8">
        <Settings size={28} className="text-blue-600" />
        <h1 className="font-heading text-2xl font-extrabold text-slate-950">Settings</h1>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <div className="grid gap-8 lg:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-28 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<ProfileForm>(emptyForm)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [projects, setProjects] = useState<ShowcaseProject[]>([defaultProject])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await api.get<ProfileResponse>('/api/profile/')
        if (!active) return
        setProfile(data)
        setForm(toForm(data))
      } catch {
        if (active) setError('Could not load your profile. Please try again.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])

  const displayName = form.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || 'Your Name'
  const avatarInitials = initialsFrom(displayName, form.email)

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateUser({ avatar: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const payload = {
      email: form.email,
      full_name: form.full_name,
      professional_title: form.professional_title,
      location: form.location,
      bio: form.bio,
    }

    try {
      const { data } = await api.patch<ProfileResponse>('/api/profile/', payload)
      setProfile(data)
      setForm(toForm(data))
      setSuccess('Profile saved successfully.')
    } catch {
      setError('Could not save your profile. Please check the fields and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateProject = (id: number, field: keyof Omit<ShowcaseProject, 'id' | 'technologies'>, value: string) => {
    setProjects((current) => current.map((project) => (project.id === id ? { ...project, [field]: value } : project)))
  }

  const removeProject = (id: number) => {
    setProjects((current) => current.filter((project) => project.id !== id))
  }

  const addProject = () => {
    setProjects((current) => [
      ...current,
      {
        id: Date.now(),
        name: '',
        link: '',
        description: '',
        technologies: ['React', 'API'],
      },
    ])
  }

  if (isLoading) return <ProfileSkeleton />

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-dashboard-card md:p-8">
        <div className="grid gap-8 lg:grid-cols-[150px_1fr]">
          <aside className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-100 bg-gradient-to-br from-slate-800 to-slate-600 text-3xl font-bold text-white shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  avatarInitials || <User size={34} />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Edit avatar"
                className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <h2 className="mt-5 text-base font-bold text-slate-950">{displayName}</h2>
            <p className="text-sm text-slate-500">{form.location || 'Add your location'}</p>
          </aside>

          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full Name" name="full_name" value={form.full_name} onChange={handleInputChange} placeholder="Alex Morgan" />
              <Field
                label="Professional Title"
                name="professional_title"
                value={form.professional_title}
                onChange={handleInputChange}
                placeholder="Senior Full Stack Developer"
              />
              <Field label="Email Address" name="email" value={form.email} onChange={handleInputChange} type="email" />
              <Field label="Location" name="location" value={form.location} onChange={handleInputChange} placeholder="San Francisco, USA" />
            </div>

            <label className="block">
              <span className="block text-sm font-semibold text-slate-700 mb-2">Bio</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Experienced full-stack developer with a passion for building scalable web applications."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="min-w-40 rounded-lg bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-dashboard-card md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ExternalLink size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-950">Showcase Projects</h2>
          </div>
          <button type="button" onClick={addProject} className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700">
            <Plus size={15} />
            Add New Project
          </button>
        </div>

        <div className="space-y-5">
          {projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Project Name</span>
                  <input
                    value={project.name}
                    onChange={(event) => updateProject(project.id, 'name', event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Project Link</span>
                  <input
                    value={project.link}
                    onChange={(event) => updateProject(project.id, 'link', event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>
              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Description</span>
                <input
                  value={project.description}
                  onChange={(event) => updateProject(project.id, 'description', event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-bold uppercase tracking-widest text-slate-500">Technologies Used</span>
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-600">
                    {tech} x
                  </span>
                ))}
                <button type="button" className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500">
                  + Add Tag
                </button>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeProject(project.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} />
                  Remove Project
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addProject}
            className="flex min-h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
          >
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900">
              <Plus size={22} />
            </span>
            Add another project to your portfolio
          </button>
        </div>
      </section>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="-mx-4 -mt-4 md:-mx-8 md:-mt-10">
      <SettingsHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <ProfileTab />
      </main>
    </div>
  )
}
