import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import { MantineProvider } from '@mantine/core'
import { CVPreview } from '@/features/cv-builder/components/CVPreview'
import { PersonalDetailsForm } from '@/features/cv-builder/components/PersonalDetailsForm'
import { WorkExperienceForm } from '@/features/cv-builder/components/WorkExperienceForm'
import { EducationForm } from '@/features/cv-builder/components/EducationForm'
import { SkillsForm } from '@/features/cv-builder/components/SkillsForm'
import { ProgressBar } from '@/features/cv-builder/components/ProgressBar'
import type { CVData } from '@/features/cv-builder/types'
import '@/features/cv-builder/cv-builder.css'

// Mock pre-filled data — replace with API call using `id`
const MOCK_INITIAL_DATA: CVData = {
  personal: {
    fullName: 'Abdullah Ahmed',
    title: 'Senior Frontend Developer',
    email: 'abdullah@example.com',
    phone: '+20 100 000 0000',
    location: 'Cairo, Egypt',
    url: 'github.com/abdullah',
    summary:
      'Experienced frontend developer with 6+ years building scalable web applications using React, TypeScript and modern toolchains.',
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
  ],
  education: [
    {
      id: '1',
      school: 'Cairo University',
      degree: 'B.Sc. Computer Science',
      year: '2019',
      description: 'Graduated with distinction.',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Figma', 'AWS'],
}

const STEPS = [
  { label: 'Personal Details', nextLabel: 'Work Experience' },
  { label: 'Work Experience', nextLabel: 'Education' },
  { label: 'Education', nextLabel: 'Skills' },
  { label: 'Skills', nextLabel: 'Save' },
]

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [cvData, setCvData] = useState<CVData>(MOCK_INITIAL_DATA)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const stepInfo = STEPS[step - 1]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: PUT /api/cv/{id}/ with cvData
      await new Promise((r) => setTimeout(r, 1000))
      setSaved(true)
      setTimeout(() => navigate(-1), 1200)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="cv-builder-root flex flex-col h-full w-full">
      <MantineProvider
        cssVariablesSelector=".cv-builder-root"
        theme={{
          fontFamily: 'Inter, sans-serif',
          headings: { fontFamily: 'Manrope, sans-serif' },
          primaryColor: 'blue',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-800">Edit CV</h1>
            <p className="text-xs text-slate-400">CV #{id}</p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className="ml-auto flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            {saved ? (
              <>
                <CheckCircle size={15} />
                Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </>
            )}
          </button>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8 flex-1 min-h-0">
          {/* Left: Form */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ProgressBar
              step={step}
              totalSteps={4}
              title={stepInfo.label}
              description=""
              nextStepLabel={stepInfo.nextLabel}
            />

            {step === 1 && (
              <PersonalDetailsForm
                data={cvData.personal}
                onChange={(personal) => setCvData({ ...cvData, personal })}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <WorkExperienceForm
                data={cvData.experience}
                onChange={(experience) => setCvData({ ...cvData, experience })}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <EducationForm
                data={cvData.education}
                onChange={(education) => setCvData({ ...cvData, education })}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <SkillsForm
                data={cvData.skills}
                onChange={(skills) => setCvData({ ...cvData, skills })}
                onNext={handleSave}
                onBack={() => setStep(3)}
              />
            )}
          </div>

          {/* Right: Live CV Preview */}
          <div
            className="w-[420px] flex-shrink-0 hidden lg:block"
            style={{ position: 'sticky', top: 40, height: 'calc(100vh - 120px)' }}
          >
            <CVPreview data={cvData} />
          </div>
        </div>
      </MantineProvider>
    </div>
  )
}
