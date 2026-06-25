import type { CivicReport } from '@/lib/seed-reports'
import { SeverityBadge } from './severity-badge'

interface HITLPanelProps {
  report: CivicReport
}

export function HITLPanel({ report }: HITLPanelProps) {
  return (
    <div className="rounded-lg border border-[#E8E4DB] bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#1A1208]">{report.department}</h3>
          <p className="text-xs text-[#7A6A58] mt-1" style={{ fontFamily: 'JetBrains Mono' }}>
            {report.category.replace(/_/g, ' ')}
          </p>
        </div>
        <SeverityBadge severity={report.severity} />
      </div>

      <p className="text-sm leading-relaxed text-[#1A1208] mb-4">{report.description}</p>

      <div className="border-t border-[#E8E4DB] pt-3 mb-3">
        <p className="text-xs text-[#7A6A58] mb-1">Status</p>
        <p className="text-sm font-medium text-[#1A1208] capitalize">
          {(report.status ?? 'reported').replace(/_/g, ' ')}
        </p>
      </div>

      {report.resolutionTimeEstimate ? (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className="text-[#7A6A58]">Expected resolution:</span>
          <span className="font-semibold text-[#1A1208]">
            {report.resolutionTimeEstimate}
          </span>
        </div>
      ) : (
        <p className="text-xs text-[#7A6A58] mt-1 italic">
          Timeline varies by department
        </p>
      )}
    </div>
  )
}
