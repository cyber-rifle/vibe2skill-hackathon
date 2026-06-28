"use client"
import { useReports } from "@/lib/report-context"
import { seedReports } from "@/lib/seed-reports"
import { Navbar } from "@/components/navbar"
import { CitizenProfile } from "@/components/citizen-profile"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Pothole / Road",
  water_leakage: "Water Leakage",
  streetlight: "Streetlight",
  waste_management: "Waste Management",
  other: "Other Infrastructure",
}
const CATEGORY_ICONS: Record<string, string> = {
  pothole: "🛣️",
  water_leakage: "💧",
  streetlight: "💡",
  waste_management: "🗑️",
  other: "🏗️",
}
const SEVERITY_COLORS: Record<string, string> = {
  low: "#5BBFBF", medium: "#D4AF37", high: "#E8957A",
}
const STATUS_LABELS: Record<string, string> = {
  reported: "Reported", acknowledged: "Acknowledged", verified: "Verified",
  in_progress: "In Progress", resolved: "Resolved",
}
const STATUS_COLORS: Record<string, string> = {
  reported: "#C9A84C", acknowledged: "#5BBFBF", verified: "#7BCFCF",
  in_progress: "#D4AF37", resolved: "#22c55e",
}
const DEPT_COLORS: Record<string, string> = {
  "GHMC Roads Department": "#E8957A",
  "HMWSSB": "#5BBFBF",
  "Electrical/Streetlighting": "#D4AF37",
  "GHMC Sanitation": "#22c55e",
  "Municipal Corporation": "#C9A84C",
}

function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut", delay }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = target / 36
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { setV(target); clearInterval(t) }
      else setV(Math.floor(cur))
    }, 28)
    return () => clearInterval(t)
  }, [target])
  return <>{v}{suffix}</>
}

export default function DashboardPage() {
  const { confirmedReports } = useReports()
  const allReports = [...seedReports, ...confirmedReports]
  const [tab, setTab] = useState<"overview" | "departments" | "activity">("overview")

  const byCategory: Record<string, number> = {}
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 }
  const byStatus: Record<string, number> = {
    reported: 0, acknowledged: 0, verified: 0, in_progress: 0, resolved: 0,
  }
  const byDept: Record<string, number> = {}

  for (const r of allReports) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1
    if (r.severity) bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1
    byStatus[r.status ?? "reported"] = (byStatus[r.status ?? "reported"] ?? 0) + 1
    byDept[r.department] = (byDept[r.department] ?? 0) + 1
  }

  const total = allReports.length || 1
  const resolvedPct = Math.round(((byStatus.resolved ?? 0) / total) * 100)
  const activeCount = (byStatus.reported ?? 0) + (byStatus.acknowledged ?? 0) + (byStatus.in_progress ?? 0)
  const highCount = bySeverity.high ?? 0
  const maxCat = Math.max(...Object.values(byCategory), 1)
  const maxDept = Math.max(...Object.values(byDept), 1)

  const recent = [...allReports]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 6)

  const KPIS = [
    { label: "Total Reports", value: allReports.length, suffix: "", color: "#5BBFBF", sub: "all time" },
    { label: "Active Now", value: activeCount, suffix: "", color: "#D4AF37", sub: "need attention" },
    { label: "High Severity", value: highCount, suffix: "", color: "#E8957A", sub: "urgent" },
    { label: "Resolved", value: resolvedPct, suffix: "%", color: "#22c55e", sub: "resolution rate" },
  ]

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      {/* Mission-control header — deep navy */}
      <div className="bg-[#0A1628] border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#5BBFBF] mb-2">
              Live Intelligence · Hyderabad
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-white mb-1">
              CivicPulse Dashboard
            </h1>
            <p className="text-white/40 font-sans text-sm">
              Real-time civic intelligence — updates as reports come in
            </p>
          </motion.div>

          {/* KPI strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {KPIS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-white/10 px-5 py-4"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-1">
                  {kpi.label}
                </p>
                <p className="font-display text-3xl font-light" style={{ color: kpi.color }}>
                  <CountUp target={kpi.value} suffix={kpi.suffix} />
                </p>
                <p className="font-mono text-[10px] text-white/30 mt-1">{kpi.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex gap-0 border-b border-[#E8E4DB] mt-0">
          {(["overview", "departments", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-mono text-xs uppercase tracking-wider px-5 py-4
                border-b-2 transition-all -mb-px capitalize ${
                  tab === t
                    ? "border-[#5BBFBF] text-[#1A1208]"
                    : "border-transparent text-[#7A6A58] hover:text-[#1A1208]"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Category bars — 2/3 width */}
                <div className="md:col-span-2 rounded-2xl border border-[#E8E4DB] bg-white p-6">
                  <h2 className="font-display text-xl font-light text-[#1A1208] mb-5">
                    Reports by Category
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, count], i) => (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="text-lg w-6 flex-shrink-0">
                            {CATEGORY_ICONS[cat] ?? "📋"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs font-mono text-[#7A6A58] mb-1.5">
                              <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                              <span className="font-semibold text-[#1A1208]">{count}</span>
                            </div>
                            <AnimatedBar
                              pct={(count / maxCat) * 100}
                              color="#5BBFBF"
                              delay={i * 0.07}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Severity */}
                  <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5">
                    <h2 className="font-display text-base font-light text-[#1A1208] mb-4">
                      Severity Distribution
                    </h2>
                    <div className="space-y-3">
                      {(["high", "medium", "low"] as const).map((sev, i) => (
                        <div key={sev}>
                          <div className="flex justify-between text-xs font-mono text-[#7A6A58] mb-1">
                            <span className="flex items-center gap-1.5 capitalize">
                              <span className="w-2 h-2 rounded-full inline-block"
                                style={{ background: SEVERITY_COLORS[sev] }} />
                              {sev}
                            </span>
                            <span>{bySeverity[sev] ?? 0}</span>
                          </div>
                          <AnimatedBar
                            pct={((bySeverity[sev] ?? 0) / total) * 100}
                            color={SEVERITY_COLORS[sev]}
                            delay={i * 0.1}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SVG resolution ring */}
                  <div className="rounded-2xl border border-[#E8E4DB] bg-white p-5 flex flex-col items-center">
                    <h2 className="font-display text-base font-light text-[#1A1208] mb-3 self-start">
                      Resolution Rate
                    </h2>
                    <svg width="96" height="96" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke="#F2EDE4" strokeWidth="10" />
                      <motion.circle cx="50" cy="50" r="40" fill="none"
                        stroke="#22c55e" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{
                          strokeDashoffset: 2 * Math.PI * 40 * (1 - resolvedPct / 100),
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        transform="rotate(-90 50 50)"
                      />
                      <text x="50" y="54" textAnchor="middle"
                        style={{ fontSize: 18, fill: "#1A1208", fontFamily: "var(--font-display)" }}>
                        {resolvedPct}%
                      </text>
                    </svg>
                    <p className="text-xs font-mono text-[#7A6A58] mt-2">
                      {byStatus.resolved ?? 0} of {total} resolved
                    </p>
                  </div>
                </div>
              </div>

              {/* Status pipeline */}
              <div className="rounded-2xl border border-[#E8E4DB] bg-white p-6">
                <h2 className="font-display text-xl font-light text-[#1A1208] mb-5">
                  Issue Pipeline
                </h2>
                <div className="flex flex-col md:flex-row gap-2">
                  {Object.entries(byStatus)
                    .filter(([, c]) => c > 0)
                    .sort(([a], [b]) => {
                      const ord = ["reported","acknowledged","verified","in_progress","resolved"]
                      return ord.indexOf(a) - ord.indexOf(b)
                    })
                    .map(([status, count], i, arr) => (
                      <div key={status} className="flex md:flex-col items-center gap-2 flex-1">
                        <div className="flex-1 md:flex-none md:w-full rounded-xl p-3 text-center"
                          style={{
                            background: `${STATUS_COLORS[status]}12`,
                            borderTop: `3px solid ${STATUS_COLORS[status]}`,
                          }}>
                          <p className="font-display text-2xl font-light"
                            style={{ color: STATUS_COLORS[status] }}>
                            {count}
                          </p>
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#7A6A58] mt-0.5">
                            {STATUS_LABELS[status]}
                          </p>
                        </div>
                        {i < arr.length - 1 && (
                          <span className="text-[#E8E4DB] font-mono text-sm hidden md:block">→</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <CitizenProfile />
            </motion.div>
          )}

          {/* ── DEPARTMENTS TAB ── */}
          {tab === "departments" && (
            <motion.div key="departments"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {Object.entries(byDept)
                .sort(([, a], [, b]) => b - a)
                .map(([dept, count], i) => {
                  const dr = allReports.filter((r) => r.department === dept)
                  const resolved = dr.filter((r) => r.status === "resolved").length
                  const high = dr.filter((r) => r.severity === "high").length
                  const rRate = dr.length ? Math.round((resolved / dr.length) * 100) : 0
                  const col = DEPT_COLORS[dept] ?? "#5BBFBF"
                  return (
                    <motion.div key={dept}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-2xl border border-[#E8E4DB] bg-white p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-sans text-sm font-semibold text-[#1A1208]">{dept}</h3>
                          <p className="font-mono text-xs text-[#7A6A58] mt-0.5">
                            {count} total reports
                          </p>
                        </div>
                        <span className="font-display text-3xl font-light" style={{ color: col }}>
                          {count}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#FAF7F2] rounded-lg p-3">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#7A6A58]">
                            Resolved
                          </p>
                          <p className="font-sans text-lg font-semibold text-[#22c55e] mt-0.5">
                            {rRate}%
                          </p>
                        </div>
                        <div className="bg-[#FAF7F2] rounded-lg p-3">
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#7A6A58]">
                            Urgent
                          </p>
                          <p className="font-sans text-lg font-semibold text-[#E8957A] mt-0.5">
                            {high}
                          </p>
                        </div>
                      </div>
                      <AnimatedBar
                        pct={(count / maxDept) * 100}
                        color={col}
                        delay={i * 0.05}
                      />
                    </motion.div>
                  )
                })}
            </motion.div>
          )}

          {/* ── ACTIVITY TAB ── */}
          {tab === "activity" && (
            <motion.div key="activity"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <div className="rounded-2xl border border-[#E8E4DB] bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8E4DB]">
                  <h2 className="font-display text-xl font-light text-[#1A1208]">
                    Recent Activity
                  </h2>
                  <p className="text-xs font-mono text-[#7A6A58] mt-0.5">
                    Latest {recent.length} reports
                  </p>
                </div>
                <div className="divide-y divide-[#F2EDE4]">
                  {recent.map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4 px-6 py-4 hover:bg-[#FAF7F2] transition-colors"
                    >
                      <span className="text-xl mt-0.5 flex-shrink-0">
                        {CATEGORY_ICONS[r.category] ?? "📋"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-sans text-sm font-medium text-[#1A1208] truncate">
                            {r.department}
                          </p>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: `${SEVERITY_COLORS[r.severity] ?? "#5BBFBF"}20`,
                              color: SEVERITY_COLORS[r.severity] ?? "#5BBFBF",
                            }}>
                            {r.severity}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: `${STATUS_COLORS[r.status ?? "reported"]}15`,
                              color: STATUS_COLORS[r.status ?? "reported"],
                            }}>
                            {STATUS_LABELS[r.status ?? "reported"]}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A6A58] mt-1 line-clamp-1">
                          {r.description}
                        </p>
                        {(r as any).resolutionTimeEstimate && (
                          <p className="text-[10px] font-mono text-[#5BBFBF] mt-0.5">
                            ⏱ {(r as any).resolutionTimeEstimate}
                          </p>
                        )}
                      </div>
                      {r.timeAgo && (
                        <p className="text-[10px] font-mono text-[#7A6A58] flex-shrink-0 mt-1">
                          {r.timeAgo}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
