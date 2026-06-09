import { useEffect, useRef, useState } from 'react'
import { MoreVertical, PlusCircle, Sparkles, Star, Pencil, Trash2, PenLine } from 'lucide-react'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchCustomCVs,
  selectCustomCvPagination,
  selectCustomCvState,
  setCustomCvPage,
  deleteCV,
  makeBaseCv,
  renameCV,
} from '@/store/slices/customCvSlice'
import CvRowSkeleton from './components/CvRowSkeleton'
import { useNavigate } from 'react-router-dom'
import { CvPdfDownloadButton } from '@/features/cv-builder/components/CvPdfDownloadButton'
import type { CVData } from '@/features/cv-builder/types'
import type { CustomCV } from '@/services/jobsApi'

/**
 * Builds a minimal CVData object from the list-level metadata.
 * When a real GET /api/cv/{id}/ endpoint is available, replace this
 * with an actual fetch so the PDF contains the full content.
 */
function buildPlaceholderCvData(row: CustomCV): CVData {
  return {
    personal: {
      fullName: '',
      title: row.title,
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
}

interface DropdownState {
  openId: number | null
}

export default function CustomCVPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, currentPage } = useAppSelector(selectCustomCvState)
  const { totalItems, totalPages, startIndex, endIndex, paginatedItems, allItems } =
    useAppSelector(selectCustomCvPagination)

  const [dropdown, setDropdown] = useState<DropdownState>({ openId: null })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [renameId, setRenameId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState<string>('')

  const hasBaseCv = allItems.some((cv) => cv.base_cv)

  useEffect(() => {
    dispatch(fetchCustomCVs())
  }, [dispatch])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown({ openId: null })
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleDropdown = (id: number) => {
    setDropdown((prev) => ({ openId: prev.openId === id ? null : id }))
  }

  const handleRenameSubmit = (id: number, originalTitle: string) => {
    if (renameId !== id) return
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== originalTitle) {
      dispatch(renameCV({ id, newTitle: trimmed }))
    }
    setRenameId(null)
  }

  const handleRenameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: number,
    originalTitle: string
  ) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id, originalTitle)
    } else if (e.key === 'Escape') {
      setRenameId(null)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-275 mx-auto">
      <div className="flex justify-end gap-4 mb-6 mt-4">
        {!hasBaseCv && (
          <button
            onClick={() => navigate('/cv-builder')}
            className="flex items-center justify-center gap-2 h-10 px-5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-sm"
          >
            <PlusCircle size={18} />
            Generate Base CV
          </button>
        )}
      </div>

      <div className="bg-white border text-left border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-cv-table-new items-center border-b border-slate-200 px-6 py-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Generated</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">CV Title</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Edit with AI</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider justify-self-end mr-4">Actions</div>
        </div>

        <div className="flex flex-col flex-1 divide-y divide-slate-100" ref={dropdownRef}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <CvRowSkeleton key={index} />
              ))
            : error
            ? <p className="px-6 py-5 text-sm text-red-500">{error}</p>
            : paginatedItems.map((row) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-cv-table-new items-center px-6 py-5 relative transition-colors ${
                    row.base_cv
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">{row.date}</span>
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 w-full">
                      {renameId === row.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => handleRenameKeyDown(e, row.id, row.title)}
                          onBlur={() => handleRenameSubmit(row.id, row.title)}
                          autoFocus
                          className="text-base font-bold text-slate-800 bg-white border border-blue-500 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-100 w-full max-w-md"
                        />
                      ) : (
                        <>
                          <span className="text-base font-bold text-slate-800 truncate">{row.title}</span>
                          {row.base_cv && (
                            <span className="inline-flex items-center gap-1 h-5 px-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-full shrink-0">
                              <Star size={10} className="fill-blue-500 text-blue-500" />
                              Base CV
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">Applied to: {row.appliedTo}</div>
                  </div>

                  {/* Edit with AI */}
                  <div>
                    <button
                      onClick={() => navigate(`/jobs/cv/${row.id}/ai-edit`)}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                    >
                      <Sparkles size={12} className="text-blue-500" />
                      Edit with AI
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 text-slate-400 relative">
                    {/* Download as PDF */}
                    <CvPdfDownloadButton
                      cvData={buildPlaceholderCvData(row)}
                      filename={row.title}
                    />

                    {/* 3-dot menu */}
                    <div className="relative">
                      <button
                        aria-label="More options"
                        onClick={() => toggleDropdown(row.id)}
                        className="hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical size={17} strokeWidth={2} />
                      </button>

                      {dropdown.openId === row.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in">
                          <button
                            onClick={() => {
                              setDropdown({ openId: null })
                              navigate(`/jobs/cv/${row.id}/edit`)
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          >
                            <Pencil size={14} className="text-slate-400" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setRenameId(row.id)
                              setRenameValue(row.title)
                              setDropdown({ openId: null })
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          >
                            <PenLine size={14} className="text-slate-400" />
                            Rename
                          </button>
                          {!row.base_cv && (
                            <button
                              onClick={() => {
                                dispatch(makeBaseCv(row.id))
                                setDropdown({ openId: null })
                              }}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors text-left"
                            >
                              <Star size={14} className="text-blue-400" />
                              Make as Base CV
                            </button>
                          )}
                          <div className="border-t border-slate-100" />
                          <button
                            onClick={() => {
                              dispatch(deleteCV(row.id))
                              setDropdown({ openId: null })
                            }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <div className="text-sm font-medium text-slate-500">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(setCustomCvPage(page))}
            activePageClassName="bg-blue-500 text-white"
            inactivePageClassName="text-slate-500 hover:bg-slate-50"
            prevNextClassName="w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
