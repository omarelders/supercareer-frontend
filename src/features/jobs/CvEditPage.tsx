import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react'
import { MantineProvider } from '@mantine/core'
import { CVPreview } from '@/features/cv-builder/components/CVPreview'
import { PersonalDetailsForm } from '@/features/cv-builder/components/PersonalDetailsForm'
import { WorkExperienceForm } from '@/features/cv-builder/components/WorkExperienceForm'
import { EducationForm } from '@/features/cv-builder/components/EducationForm'
import { SkillsForm } from '@/features/cv-builder/components/SkillsForm'
import { ProgressBar } from '@/features/cv-builder/components/ProgressBar'
import type { CVData } from '@/features/cv-builder/types'
import { getCvContent, saveCvContent } from '@/services/jobsApi'
import '@/features/cv-builder/cv-builder.css'

const EMPTY_CV: CVData = {
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

const STEPS = [
  { label: 'Personal Details', nextLabel: 'Work Experience' },
  { label: 'Work Experience', nextLabel: 'Education' },
  { label: 'Education', nextLabel: 'Skills' },
  { label: 'Skills', nextLabel: 'Save' },
]

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [cvData, setCvData] = useState<CVData>(EMPTY_CV)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const stepInfo = STEPS[step - 1]

  // -------------------------------------------------------------------------
  // Load CV content via GET /api/documents/cv/{id}/
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      setIsDataLoading(false)
      return
    }

    let cancelled = false

    async function loadData() {
      setIsDataLoading(true)
      setLoadError(null)

      try {
        const stored = await getCvContent(Number(id))
        if (!cancelled) {
          setCvData(stored)
          setIsDataLoading(false)
        }
      } catch (err) {
        console.error('Failed to load CV content:', err)
        if (!cancelled) {
          setLoadError('Could not load CV data. Starting with an empty template.')
          setIsDataLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [id])

  // -------------------------------------------------------------------------
  // Save via PATCH /api/documents/cv/{id}/ with ApiCV format
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (id) {
        await saveCvContent(Number(id), cvData)
      }
      setSaved(true)
      setTimeout(() => navigate(-1), 600)
    } catch (err) {
      console.error('Failed to save CV changes:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 gap-2 text-sm">
        <Loader2 size={18} className="animate-spin" />
        Loading CV…
      </div>
    )
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
            <h1 className="text-base font-bold text-slate-800">Edit Manually</h1>
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

        {/* Load error banner */}
        {loadError && (
          <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
            {loadError}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row lg:gap-8 flex-1 min-h-0">
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
                cvData={cvData}
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
