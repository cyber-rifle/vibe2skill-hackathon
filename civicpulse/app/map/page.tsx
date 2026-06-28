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

      {/* Feature 18 — scroll-triggered reveal on map page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="border-b border-white/10 bg-[#0D0B08] px-6 py-5 relative overflow-hidden"
      >
        <div aria-hidden="true" className="ambient-orb absolute right-0 top-0
          h-32 w-64 opacity-[0.20]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-light mb-1 text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Community Reports
            </h1>
            <p className="text-sm text-white/50">View and track civic issues reported in Hyderabad</p>
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

      <div className="relative flex-1 overflow-hidden min-h-0">
        {/* Map — full bleed */}
        <div className="absolute inset-0">
          {allReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#FAF7F2]">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-display text-xl text-[#1A1208]">No reports yet</p>
              <p className="text-sm text-[#7A6A58] mt-1">Be the first to report an issue</p>
              <a href="/#upload" className="mt-4 shimmer-btn rounded-full px-5 py-2 text-sm">
                Report an Issue
              </a>
            </div>
          ) : (
            <CivicMap reports={allReports} selectedId={selectedId}
              onMarkerClick={setSelectedId} />
          )}
          <MapLegend />
        </div>
      
        {/* Glassmorphism sidebar */}
        <div className="absolute right-0 top-0 md:top-4 md:bottom-4 md:right-4
          bottom-0 w-full md:w-[22rem] z-10 flex flex-col
          md:rounded-2xl overflow-hidden
          bg-white/80 md:backdrop-blur-xl md:bg-white/70
          border-t md:border md:border-white/50
          md:shadow-2xl
          max-h-[42vh] md:max-h-none">
          <div className="flex-shrink-0 px-5 py-4 border-b border-black/5">
            <h2 className="font-display text-xl font-light text-[#1A1208]">Active Reports</h2>
            <p className="text-xs text-[#7A6A58] mt-0.5 font-mono">
              {allReports.length} reports in Hyderabad
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
