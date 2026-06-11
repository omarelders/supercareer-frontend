/**
 * CvPdfDownloadButton.tsx
 *
 * A self-contained download button that:
 *  1. Receives CV data (or a cv title for the filename)
 *  2. Renders a hidden, off-screen CVPreview into a portal div
 *  3. Captures that div with html2canvas → jsPDF → downloads the file
 *
 * Usage:
 *   <CvPdfDownloadButton cvData={cvData} filename="My CV" />
 */
import { useRef, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Download, Loader2 } from 'lucide-react'
import { MantineProvider } from '@mantine/core'
import { CVPreview } from '@/features/cv-builder/components/CVPreview'
import { downloadCvAsPdf } from '@/features/cv-builder/utils/downloadCvAsPdf'
import type { CVData } from '@/features/cv-builder/types'

interface Props {
  cvData?: CVData
  fetchCvData?: () => Promise<CVData>
  filename?: string
  /** Optional extra className for the button */
  className?: string
}

export function CvPdfDownloadButton({ cvData, fetchCvData, filename = 'CV', className = '' }: Props) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeCvData, setActiveCvData] = useState<CVData | null>(cvData || null)
  
  useEffect(() => {
    if (cvData) setActiveCvData(cvData)
  }, [cvData])
  const [portalEl] = useState(() => {
    const el = document.createElement('div')
    // Position completely off-screen so it's rendered but invisible
    el.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:794px;z-index:-1;pointer-events:none;'
    return el
  })
  const cvRef = useRef<HTMLDivElement>(null)

  // Attach / detach the portal element to the document body
  useEffect(() => {
    document.body.appendChild(portalEl)
    return () => {
      document.body.removeChild(portalEl)
    }
  }, [portalEl])

  const handleDownload = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      let currentData = activeCvData
      if (fetchCvData && !currentData) {
        currentData = await fetchCvData()
        setActiveCvData(currentData)
      }

      if (!currentData) {
        throw new Error('No CV data available')
      }

      // Give React a tick to render the portal with the new data
      await new Promise((r) => setTimeout(r, 150))
      
      if (cvRef.current) {
        await downloadCvAsPdf(cvRef.current, `${filename}.pdf`)
      }
    } catch (err) {
      console.error('[CvPdfDownloadButton] PDF generation failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }, [isDownloading, activeCvData, fetchCvData, filename])

  return (
    <>
      {/* Hidden off-screen CV render portal */}
      {activeCvData && createPortal(
        <div ref={cvRef}>
          <MantineProvider
            theme={{
              fontFamily: 'Inter, sans-serif',
              headings: { fontFamily: 'Manrope, sans-serif' },
              primaryColor: 'blue',
            }}
          >
            <CVPreview data={activeCvData} />
          </MantineProvider>
        </div>,
        portalEl,
      )}

      {/* Visible download button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Download ${filename} as PDF`}
        title="Download as PDF"
        className={`hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isDownloading ? (
          <Loader2 size={17} strokeWidth={2} className="animate-spin text-blue-500" />
        ) : (
          <Download size={17} strokeWidth={2} />
        )}
      </button>
    </>
  )
}
