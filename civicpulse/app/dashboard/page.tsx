"use client"
import { useReports } from "@/lib/report-context"
import { seedReports } from "@/lib/seed-reports"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"

const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Pothole",
  water_leakage: "Water Leakage",
  streetlight: "Streetlight",
  waste_management: "Waste Management",
  other: "Other",
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "#5BBFBF",
  medium: "#D4AF37",
  high: "#E8957A",
}

const STATUS_LABELS: Record<string, string> = {
  reported: "Reported",
  verified: "Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
}

const STATUS_COLORS: Record<string, string> = {
  reported: "#C9A84C",
  verified: "#5BBFBF",
  in_progress: "#D4AF37",
  resolved: "#22c55e",
}

export default function DashboardPage() {
  const { confirmedReports } = useReports()
  const allReports = [...seedReports, ...confirmedReports]

  // Aggregate data
  const byCategory: Record<string, number> = {}
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 }
  const byStatus: Record<string, number> = { reported: 0, verified: 0, in_progress: 0, resolved: 0 }

  for (const r of allReports) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1
    if (r.severity) bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1
    const status = r.status ?? "reported"
    byStatus[status] = (byStatus[status] ?? 0) + 1
  }

  const maxCategory = Math.max(...Object.values(byCategory), 1)
  const maxStatus = Math.max(...Object.values(byStatus), 1)
  const total = allReports.length || 1

  const resolvedPct = Math.round(((byStatus.resolved ?? 0) / total) * 100)
  const avgSeverityNum = allReports.reduce((acc, r) => {
    const map: Record<string, number> = { low: 1, medium: 3, high: 5 }
    return acc + (map[r.severity] ?? 3)
  }, 0) / total

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal mb-3">Live Intelligence</p>
          <h1 className="font-display text-5xl font-light text-[#1A1208]">
            CivicPulse Impact Dashboard
          </h1>
          <p className="mt-3 text-[#7A6A58] text-lg">Real-time civic intelligence for Hyderabad</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: allReports.length, color: "#5BBFBF" },
            { label: "Resolved", value: byStatus.resolved ?? 0, color: "#22c55e" },
            { label: "In Progress", value: byStatus.in_progress ?? 0, color: "#D4AF37" },
            { label: "Avg. Severity", value: avgSeverityNum.toFixed(1) + "/5", color: "#E8957A" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-[#7A6A58]">{stat.label}</p>
              <p className="font-display text-4xl font-light mt-2" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {/* Reports by Category — horizontal bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
          >
            <h2 className="font-display text-xl font-light text-[#1A1208] mb-6">By Category</h2>
            <div className="space-y-4">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs font-mono text-[#7A6A58] mb-1">
                      <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxCategory) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: "#5BBFBF" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Reports by Severity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
          >
            <h2 className="font-display text-xl font-light text-[#1A1208] mb-6">By Severity</h2>
            <div className="space-y-4">
              {(["high", "medium", "low"] as const).map((sev) => (
                <div key={sev}>
                  <div className="flex justify-between text-xs font-mono text-[#7A6A58] mb-1">
                    <span className="capitalize">{sev}</span>
                    <span>{bySeverity[sev] ?? 0}</span>
                  </div>
                  <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((bySeverity[sev] ?? 0) / total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Severity legend */}
            <div className="mt-6 flex gap-4">
              {(["high", "medium", "low"] as const).map((sev) => (
                <span key={sev} className="flex items-center gap-1.5 text-xs font-mono text-[#7A6A58]">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[sev] }} />
                  {sev}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Reports by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
          >
            <h2 className="font-display text-xl font-light text-[#1A1208] mb-6">By Status</h2>
            <div className="space-y-4">
              {Object.entries(byStatus)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-xs font-mono text-[#7A6A58] mb-1">
                      <span>{STATUS_LABELS[status] ?? status}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxStatus) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[status] ?? "#C9A84C" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Resolution Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
          >
            <h2 className="font-display text-xl font-light text-[#1A1208] mb-6">Resolution Rate</h2>
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              {/* Donut-style progress ring using SVG */}
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#F2EDE4"
                  strokeWidth="14"
                />
                <motion.circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - resolvedPct / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="font-display" style={{ fontSize: 22, fill: '#1A1208', fontFamily: 'Cormorant Garamond' }}>
                  {resolvedPct}%
                </text>
              </svg>
              <p className="text-sm font-mono text-[#7A6A58]">
                {byStatus.resolved ?? 0} of {total} reports resolved
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
