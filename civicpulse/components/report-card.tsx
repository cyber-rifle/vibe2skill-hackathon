import { useState } from 'react'
import { motion } from 'framer-motion'
import { SeverityBadge } from './severity-badge'
import type { CivicReport } from '@/lib/seed-reports'
import { useReports } from '@/lib/report-context'

interface ReportCardProps {
  report: CivicReport
  isSelected: boolean
  onClick: () => void
  dark?: boolean // Deprecated, kept for interface compat
}

export function ReportCard({ report, isSelected, onClick }: ReportCardProps) {
  const { comments, addComment } = useReports()
  const [commentText, setCommentText] = useState('')
  const reportComments = comments[report.id] || []

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(26,18,8,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-all bg-white
        ${isSelected ? 'border-[#C9A84C] shadow-sm-warm ring-1 ring-[#C9A84C]/50' : 'border-[#E8E4DB]'}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1A1208]">{report.department}</h3>
          <p className="text-xs font-mono text-[#7A6A58]">
            {report.category}
          </p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>
      <p className="mb-2 text-sm leading-relaxed line-clamp-2 text-[#1A1208]">
        {report.description}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-[#7A6A58]">{report.timeAgo}</span>
        {reportComments.length > 0 && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full text-[#7A6A58] bg-[#E8E4DB]/50">
            {reportComments.length} comment{reportComments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-[#E8E4DB]" onClick={(e) => e.stopPropagation()}>
          <h4 className="text-xs font-mono uppercase tracking-wider mb-3 text-[#7A6A58]">Comments</h4>
          
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
            {reportComments.map((c) => (
              <div key={c.id} className="rounded-lg p-2.5 text-sm border bg-[#FAF7F2] text-[#1A1208] border-[#E8E4DB]">
                {c.text}
              </div>
            ))}
            {reportComments.length === 0 && (
              <p className="text-xs italic text-[#7A6A58]">No comments yet. Be the first to comment!</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm rounded border border-[#E8E4DB] px-3 py-1.5 focus:outline-none focus:border-[#5BBFBF]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  addComment(report.id, commentText.trim())
                  setCommentText('')
                }
              }}
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  addComment(report.id, commentText.trim())
                  setCommentText('')
                }
              }}
              disabled={!commentText.trim()}
              className="text-xs font-mono bg-[#5BBFBF] text-white px-3 py-1.5 rounded disabled:opacity-50 transition-opacity"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
