import { useState } from 'react'
import { motion } from 'framer-motion'
import { SeverityBadge } from './severity-badge'
import type { CivicReport } from '@/lib/seed-reports'
import { useReports } from '@/lib/report-context'

interface ReportCardProps {
  report: CivicReport
  isSelected: boolean
  onClick: () => void
  dark?: boolean
}

export function ReportCard({ report, isSelected, onClick, dark = false }: ReportCardProps) {
  const { comments, addComment } = useReports()
  const [commentText, setCommentText] = useState('')
  const reportComments = comments[report.id] || []

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(26,18,8,0.10)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-all ${
        dark
          ? isSelected ? 'border-[#5BBFBF]/50 bg-[#5BBFBF]/10' : 'border-white/10 bg-white/5 hover:bg-white/8'
          : isSelected ? 'border-[#C9A84C] bg-[#FAF7F2]' : 'border-[#E8E4DB] bg-white'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[#1A1208]'}`}>{report.department}</h3>
          <p className={`text-xs font-mono ${dark ? 'text-white/50' : 'text-[#7A6A58]'}`}>
            {report.category}
          </p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>
      <p className={`mb-2 text-sm leading-relaxed line-clamp-2 ${dark ? 'text-white/80' : 'text-[#1A1208]'}`}>
        {report.description}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${dark ? 'text-white/40' : 'text-[#7A6A58]'}`}>{report.timeAgo}</span>
        {reportComments.length > 0 && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${dark ? 'bg-white/10 text-white/50' : 'text-[#7A6A58] bg-[#E8E4DB]/50'}`}>
            {reportComments.length} comment{reportComments.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-[#E8E4DB]" onClick={(e) => e.stopPropagation()}>
          <h4 className={`text-xs font-mono uppercase tracking-wider mb-3 ${dark ? 'text-white/50' : 'text-[#7A6A58]'}`}>Comments</h4>
          
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
            {reportComments.map((c) => (
              <div key={c.id} className={`rounded p-2 text-sm border ${dark ? 'bg-white/5 border-white/10 text-white/70' : 'bg-white text-[#1A1208] border-[#E8E4DB]'}`}>
                {c.text}
              </div>
            ))}
            {reportComments.length === 0 && (
              <p className={`text-xs italic ${dark ? 'text-white/40' : 'text-[#7A6A58]'}`}>No comments yet. Be the first to comment!</p>
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
