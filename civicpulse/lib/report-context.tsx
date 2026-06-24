"use client"

import React, { createContext, useContext, useState } from 'react'

export type Report = {
  id: string
  lat: number
  lon: number
  category: 'pothole' | 'water_leakage' | 'streetlight' | 'waste_management' | 'other'
  description: string
  severity: number
  status: 'reported' | 'verified' | 'in_progress' | 'resolved'
  department: string
  createdAt: string
}

type ReportContextValue = {
  confirmedReports: Report[]
  addConfirmedReport: (report: Report) => void
}

const ReportContext = createContext<ReportContextValue | null>(null)

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [confirmedReports, setConfirmedReports] = useState<Report[]>([])

  const addConfirmedReport = (report: Report) => {
    setConfirmedReports((prev) => [...prev, report])
  }

  return (
    <ReportContext.Provider value={{ confirmedReports, addConfirmedReport }}>
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
