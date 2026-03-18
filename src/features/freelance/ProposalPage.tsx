import { useEffect } from 'react'
import { Download, FileText, MoreVertical, Plus } from 'lucide-react'
import PaginationControls from '@/components/pagination/PaginationControls'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  PROPOSAL_TABS,
  fetchProposals,
  selectProposalPagination,
  selectProposalsState,
  setProposalPage,
  setProposalTab,
} from '@/store/slices/freelanceSlice'
import type { Proposal } from '@/services/freelanceApi'
import ProposalRowSkeleton from './components/ProposalRowSkeleton'

const STATUS_STYLES: Record<Proposal['status'], string> = {
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-green-100 text-green-700',
  'In Review': 'bg-amber-100 text-amber-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default function ProposalPage() {
  const dispatch = useAppDispatch()
  const { isLoading, error, currentPage, activeTab } = useAppSelector(selectProposalsState)
  const { totalItems, totalPages, startIndex, endIndex, paginatedItems } =
    useAppSelector(selectProposalPagination)

  useEffect(() => {
    dispatch(fetchProposals())
  }, [dispatch])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
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
        <button className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
          <Plus size={16} />
          Create New Proposal
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {PROPOSAL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => dispatch(setProposalTab(tab))}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
              activeTab === tab
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-proposal-table gap-4 px-8 py-5 border-b border-slate-200 bg-slate-50/50">
          {['DATE', 'PROPOSAL TITLE', 'STATUS', 'CLIENT', 'ACTION'].map((col) => (
            <div key={col} className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              {col}
            </div>
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <ProposalRowSkeleton key={index} />
              ))
            : error
            ? <p className="px-8 py-5 text-sm text-red-500">{error}</p>
            : paginatedItems.map((proposal) => (
                <div
                  key={proposal.id}
                  className="grid grid-cols-proposal-table gap-4 items-center px-8 py-5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="text-sm text-slate-500 font-medium">{proposal.date}</div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 truncate">{proposal.title}</span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 font-medium truncate">{proposal.client}</div>
                  <div className="flex items-center gap-2">
                    <button aria-label="Download proposal" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                      <Download size={18} />
                    </button>
                    <button aria-label="More options" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-slate-200 bg-white">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="text-slate-700">{Math.min(endIndex, totalItems)}</span> of{' '}
            <span className="text-slate-700">{totalItems}</span> results
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
