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
      <div className="h-full w-full bg-[#0A1628] flex items-center justify-center text-sm text-white/50">
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const allReports = [...seedReports, ...confirmedReports]

  useEffect(() => {
    if (selectedId) {
      const card = document.getElementById(`report-card-${selectedId}`)
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  return (
    <div className="flex h-screen flex-col bg-[#0A1628] overflow-hidden">
      <Navbar />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex-shrink-0 border-b border-white/10 px-6 py-4"
        style={{ background: 'rgba(10, 22, 40, 0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-light text-white">Community Reports</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5BBFBF] glow-pulse" />
              <p className="text-xs text-white/40 font-mono">{allReports.length} active · Hyderabad</p>
            </div>
          </div>
          <Link href="/#upload" className="shimmer-btn magnetic-btn rounded-full px-5 py-2 text-sm font-medium">
            Report an Issue
          </Link>
        </div>
      </motion.div>

      {/* Map + Sidebar split — true flex, not absolute */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Map area */}
        <div className="relative flex-1 min-w-0">
          {allReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0A1628]">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="font-display text-xl text-white">No reports yet</p>
              <p className="text-sm text-white/50 mt-1">Be the first to report an issue</p>
              <Link href="/#upload" className="mt-4 shimmer-btn rounded-full px-5 py-2 text-sm">Report an Issue</Link>
            </div>
          ) : (
            <CivicMap reports={allReports} selectedId={selectedId} onMarkerClick={setSelectedId} />
          )}
          <MapLegend />
        </div>

        {/* Sidebar — fixed width on desktop, bottom sheet on mobile */}
        <div className="hidden md:flex md:flex-col md:w-80 lg:w-96
          overflow-hidden flex-shrink-0 border-l border-white/10"
          style={{ background: '#0D1A2E' }}>
          <div className="flex-shrink-0 px-5 py-4 border-b border-white/10">
            <h2 className="font-display text-lg font-light text-white">Active Reports</h2>
            <p className="text-xs text-white/40 mt-0.5 font-mono">{allReports.length} reports · Hyderabad</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {allReports.map((report) => (
              <div key={report.id} id={`report-card-${report.id}`}>
                <ReportCard
                  report={report}
                  dark={true}
                  isSelected={selectedId === report.id}
                  onClick={() => setSelectedId(report.id === selectedId ? null : report.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: bottom sheet with report count badge */}
        <div className={`
          md:hidden fixed bottom-0 left-0 right-0 z-20
          bg-[#0D1A2E] border-t border-white/10
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${sheetOpen ? "max-h-[55vh]" : "max-h-[52px]"}
        `}>
          <button
            onClick={() => {
              setSheetOpen(prev => {
                const next = !prev;
                setTimeout(() => {
                  const mapEl = document.querySelector('.leaflet-container') as any;
                  if (mapEl?._leaflet_id) {
                    const map = (window as any).L?.map ? null : null; // skip
                  }
                  // Force Leaflet invalidateSize via custom event
                  window.dispatchEvent(new Event('resize'));
                }, 350);
                return next;
              });
            }}
            className="flex items-center justify-between px-4 py-3 w-full flex-shrink-0
              border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-light text-white">
                Active Reports
              </span>
              <span className="font-mono text-xs bg-[#5BBFBF]/20 text-[#5BBFBF]
                px-2 py-0.5 rounded-full">
                {allReports.length}
              </span>
            </div>
            <span className={`text-white/60 text-xs transition-transform duration-200
              ${sheetOpen ? "rotate-180" : ""}`}>
              ▲
            </span>
          </button>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {allReports.map((report) => (
              <div key={report.id} id={`report-card-mobile-${report.id}`}>
                <ReportCard
                  report={report}
                  dark={true}
                  isSelected={selectedId === report.id}
                  onClick={() => {
                    setSelectedId(report.id === selectedId ? null : report.id)
                    setSheetOpen(true)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
