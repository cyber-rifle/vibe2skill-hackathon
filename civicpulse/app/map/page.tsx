'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/navbar'
import { MapLegend } from '@/components/map-legend'
import { ReportCard } from '@/components/report-card'
import { seedReports } from '@/lib/seed-reports'
import { useReports } from '@/lib/report-context'

const CivicMap = dynamic(
  () => import('@/components/civic-map').then((m) => m.CivicMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#FAF7F2] flex items-center justify-center text-sm text-[#7A6A58]">
        Loading map...
      </div>
    ),
  }
)

export default function MapPage() {
  useEffect(() => {
    try { sessionStorage.removeItem('civicpulse_confirmed') } catch {}
  }, [])

  const { confirmedReports } = useReports()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const allReports = [...seedReports, ...confirmedReports]

  return (
    <div className="flex h-screen flex-col bg-[#0D0B08] overflow-hidden">
      <Navbar />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex-shrink-0 border-b border-white/10 bg-[#0D0B08] px-6 py-4"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-light text-white">
              Community Reports
            </h1>
            <p className="text-xs text-white/40 font-mono mt-0.5">
              {allReports.length} active reports · Hyderabad
            </p>
          </div>
          <Link href="/#upload" className="shimmer-btn rounded-full px-5 py-2 text-sm font-medium">
            Report an Issue
          </Link>
        </div>
      </motion.div>

      {/* Map + Sidebar split — true flex, not absolute */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Map area */}
        <div className="relative flex-1 min-w-0">
          {allReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#FAF7F2]">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-display text-xl text-[#1A1208]">No reports yet</p>
              <p className="text-sm text-[#7A6A58] mt-1">Be the first to report an issue</p>
              <Link href="/#upload" className="mt-4 shimmer-btn rounded-full px-5 py-2 text-sm">Report an Issue</Link>
            </div>
          ) : (
            <CivicMap reports={allReports} selectedId={selectedId} onMarkerClick={setSelectedId} />
          )}
          <MapLegend />
        </div>

        {/* Sidebar — fixed width on desktop, bottom sheet on mobile */}
        <div className="
          hidden md:flex md:flex-col md:w-80 lg:w-96
          bg-[#FAF7F2] border-l border-[#E8E4DB]
          overflow-hidden flex-shrink-0
        ">
          <div className="flex-shrink-0 px-5 py-4 border-b border-[#E8E4DB] bg-white">
            <h2 className="font-display text-lg font-light text-[#1A1208]">Active Reports</h2>
            <p className="text-xs text-[#7A6A58] mt-0.5 font-mono">
              {allReports.length} reports in Hyderabad
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {allReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedId === report.id}
                onClick={() => setSelectedId(report.id === selectedId ? null : report.id)}
              />
            ))}
          </div>
        </div>

        {/* Mobile: bottom sheet with report count badge */}
        <div className="
          md:hidden fixed bottom-0 left-0 right-0 z-20
          bg-white border-t border-[#E8E4DB]
          max-h-[45vh] flex flex-col
        ">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E4DB]">
            <span className="font-display text-base font-light text-[#1A1208]">Reports</span>
            <span className="font-mono text-xs text-[#7A6A58]">{allReports.length} total</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {allReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                isSelected={selectedId === report.id}
                onClick={() => setSelectedId(report.id === selectedId ? null : report.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
