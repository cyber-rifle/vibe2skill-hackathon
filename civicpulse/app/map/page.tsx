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
    <div className="flex h-screen flex-col bg-[#FAF7F2] overflow-hidden">
      <Navbar />

      {/* Feature 18 — scroll-triggered reveal on map page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b border-[#E8E4DB] bg-[#FAF7F2] px-6 py-5"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-light text-[#1A1208] mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Community Reports
            </h1>
            <p className="text-sm text-[#7A6A58]">View and track civic issues reported in Hyderabad</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/#upload"
              className="shimmer-btn rounded-full px-5 py-2 font-sans text-sm font-medium shadow-sm"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-1 flex-col overflow-hidden min-h-0 md:flex-row">
        <div className="relative flex-1 min-h-[50vh] md:min-h-0">
          {/* Feature 5 — Empty State for no reports */}
          {allReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-display text-xl text-[#1A1208]">No reports yet</p>
              <p className="text-sm text-[#7A6A58] mt-1">Be the first to report an issue</p>
              <a href="/#upload" className="mt-4 shimmer-btn rounded-full px-5 py-2 text-sm">
                Report an Issue
              </a>
            </div>
          ) : (
            <CivicMap reports={allReports} selectedId={selectedId} onMarkerClick={setSelectedId} />
          )}
          <MapLegend />
        </div>

        <div className="w-full md:w-80 flex flex-col border-t md:border-t-0 md:border-l border-[#E8E4DB] bg-white overflow-hidden max-h-[40vh] md:max-h-none">
          <div className="flex-shrink-0 border-b border-[#E8E4DB] px-4 py-4">
            <h2 className="text-sm font-semibold text-[#1A1208]">Active Reports</h2>
            <p className="text-xs text-[#7A6A58] mt-1">{allReports.length} reports in Hyderabad</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Feature 5 — Empty state when no reports in sidebar */}
            {allReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-mono text-[#7A6A58]">No reports match this filter</p>
              </div>
            ) : (
              allReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isSelected={selectedId === report.id}
                  onClick={() => setSelectedId(report.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
