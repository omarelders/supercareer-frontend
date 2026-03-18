import { useEffect } from 'react'
import { Download, Filter, MoreVertical, PlusCircle } from 'lucide-react'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchCustomCVs,
  selectCustomCvPagination,
  selectCustomCvState,
  setCustomCvPage,
} from '@/store/slices/customCvSlice'
import CvRowSkeleton from './components/CvRowSkeleton'

export default function CustomCVPage() {
  const dispatch = useAppDispatch()
  const { isLoading, error, currentPage } = useAppSelector(selectCustomCvState)
  const { totalItems, totalPages, startIndex, endIndex, paginatedItems } =
    useAppSelector(selectCustomCvPagination)

  useEffect(() => {
    dispatch(fetchCustomCVs())
  }, [dispatch])

  return (
    <div className="flex flex-col h-full w-full max-w-275 mx-auto">
      <div className="flex justify-end gap-4 mb-6 mt-4">
        <button className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <Filter size={16} className="text-slate-500" />
          Filter
        </button>
        <button className="flex items-center justify-center gap-2 h-10 px-5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-sm">
          <PlusCircle size={18} />
          Generate New CV
        </button>
      </div>

      <div className="bg-white border text-left border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col">
        <div className="grid grid-cols-cv-table items-center border-b border-slate-200 px-6 py-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Generated</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">CV Title</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider justify-self-end mr-4">Actions</div>
        </div>

        <div className="flex flex-col flex-1 divide-y divide-slate-100">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <CvRowSkeleton key={index} />
              ))
            : error
            ? <p className="px-6 py-5 text-sm text-red-500">{error}</p>
            : paginatedItems.map((row) => (
                <div key={row.id} className="grid grid-cols-cv-table items-center px-6 py-5">
                  <div className="text-sm font-medium text-slate-500">{row.date}</div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-base font-bold text-slate-800">{row.title}</div>
                    <div className="text-sm text-slate-400">Applied to: {row.appliedTo}</div>
                  </div>
                  <div className="flex items-center">
                    {row.status === 'Completed' ? (
                      <span className="inline-flex items-center justify-center h-6 px-2.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center h-6 px-2.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-500">{row.format}</div>
                  <div className="flex items-center justify-end gap-3 text-slate-400">
                    {row.status === 'Completed' ? (
                      <>
                        <button aria-label="Download CV" className="hover:text-slate-600 p-1 transition-colors">
                          <Download size={18} strokeWidth={2} />
                        </button>
                        <button aria-label="More options" className="hover:text-slate-600 p-1 transition-colors">
                          <MoreVertical size={18} strokeWidth={2} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="text-blue-500 hover:text-blue-600 text-sm font-bold p-1 transition-colors">
                          Edit
                        </button>
                        <button className="hover:text-slate-600 p-1 transition-colors">
                          <MoreVertical size={18} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
        </div>

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
