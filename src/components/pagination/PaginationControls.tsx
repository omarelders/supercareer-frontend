import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildPaginationItems } from '@/lib/pagination'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  activePageClassName?: string
  inactivePageClassName?: string
  prevNextClassName?: string
}

const DEFAULT_ACTIVE_PAGE_CLASS =
  'bg-blue-600 text-white'

const DEFAULT_INACTIVE_PAGE_CLASS =
  'border border-slate-200 text-slate-600 hover:bg-slate-50'

const DEFAULT_PREV_NEXT_CLASS =
  'w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  activePageClassName = DEFAULT_ACTIVE_PAGE_CLASS,
  inactivePageClassName = DEFAULT_INACTIVE_PAGE_CLASS,
  prevNextClassName = DEFAULT_PREV_NEXT_CLASS,
}: PaginationControlsProps) {
  const pages = buildPaginationItems(totalPages, currentPage)
  const canGoPrev = currentPage > 1
  const canGoNext = totalPages > 0 && currentPage < totalPages

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={!canGoPrev}
        className={prevNextClassName}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span key={`ellipsis-${index}`} className="text-slate-400 font-bold px-1">
              ...
            </span>
          )
        }

        const isActive = item === currentPage
        return (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded text-sm font-semibold transition-colors',
              isActive ? activePageClassName : inactivePageClassName
            )}
          >
            {item}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={!canGoNext}
        className={prevNextClassName}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
