"use client"

import React, { createContext, useContext, useState } from 'react'

export type ReportSeverity = 'low' | 'medium' | 'high'

export function severityLabel(n: number): ReportSeverity {
  if (n <= 2) return 'low'
  if (n === 3) return 'medium'
  return 'high'
}

export type Report = {
  id: string
  lat: number
  lon: number
  category: 'pothole' | 'water_leakage' | 'streetlight' | 'waste_management' | 'other'
  description: string
  severity: ReportSeverity
  department: string
  timeAgo: string
  report: string
  status: 'reported' | 'acknowledged' | 'verified' | 'in_progress' | 'resolved'
  createdAt: string
}

type ReportContextValue = {
  confirmedReports: Report[]
  addConfirmedReport: (report: Report) => void
  reportCount: number
}

const ReportContext = createContext<ReportContextValue | null>(null)

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [confirmedReports, setConfirmedReports] = useState<Report[]>([])
  // Feature 4 — Live stat counter initialized to 1240
  const [reportCount, setReportCount] = useState(1240)

  const addConfirmedReport = (report: Report) => {
    setConfirmedReports((prev) => [...prev, report])
    // Feature 4 — Increment by 1 on each new report
    setReportCount((prev) => prev + 1)
  }

  return (
    <ReportContext.Provider value={{ confirmedReports, addConfirmedReport, reportCount }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReports() {
  const context = useContext(ReportContext)
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider')
  }
  return context
}
