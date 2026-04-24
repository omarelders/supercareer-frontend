import { useEffect } from 'react'
import { Copy, FileText } from 'lucide-react'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProposals,
  selectProposalPagination,
  selectProposalsState,
  setProposalPage,
} from '@/store/slices/freelanceSlice'
import ProposalRowSkeleton from './components/ProposalRowSkeleton'



export default function ProposalPage() {
  const dispatch = useAppDispatch()
  const { isLoading, error, currentPage } = useAppSelector(selectProposalsState)
  const { totalItems, totalPages, startIndex, endIndex, paginatedItems } =
    useAppSelector(selectProposalPagination)

  useEffect(() => {
    dispatch(fetchProposals())
  }, [dispatch])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h1 className="text-3xl font-extrabold text-foreground leading-tight mb-2">
            Manage your bids
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Review and track the status of all your AI-generated business proposals. You can
            download the final PDF or edit drafts.
          </p>
        </div>
      </div>



      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-proposal-table gap-4 px-8 py-5 border-b border-slate-200 bg-slate-50/50 font-bold tracking-widest text-slate-500 uppercase text-xs">
          <span>DATE</span>
          <span>PROPOSAL TITLE</span>
          <span>CLIENT</span>
          <span>COPY</span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <ProposalRowSkeleton key={index} />
              ))
            : error
            ? <p className="px-8 py-5 text-sm text-red-500">{error}</p>
            : paginatedItems.map((proposal, index) => (
                <div
                  key={proposal.id}
                  className={`flex flex-col md:grid md:grid-cols-proposal-table gap-3 md:gap-4 md:items-center px-6 md:px-8 py-5 hover:bg-slate-50/50 transition-colors ${
                    index < paginatedItems.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-center md:block">
                    <div className="text-xs md:text-sm text-slate-500 font-medium">{proposal.date}</div>
                    <div className="md:hidden">
                       <button aria-label="Copy proposal" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors bg-slate-50">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 truncate">{proposal.title}</span>
                  </div>

                  <div className="text-xs md:text-sm text-slate-600 font-medium truncate italic md:not-italic">
                    <span className="md:hidden text-slate-400 not-italic mr-1">Client:</span>
                    {proposal.client}
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <button aria-label="Copy proposal" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-slate-200 bg-white">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="text-slate-700">{Math.min(endIndex, totalItems)}</span> <span className="hidden sm:inline">of{' '}
            <span className="text-slate-700">{totalItems}</span> results</span>
          </p>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => dispatch(setProposalPage(page))}
          />
        </div>
      </div>
    </div>
  )
}
