"use client"
import { useReports } from "@/lib/report-context"
import { motion } from "framer-motion"

const BADGES = [
  { threshold: 1, label: "First Report", icon: "🌱" },
  { threshold: 3, label: "Active Citizen", icon: "🏙️" },
  { threshold: 5, label: "Neighborhood Watch", icon: "👁️" },
  { threshold: 10, label: "Civic Champion", icon: "🏆" },
]

export function CitizenProfile() {
  const { confirmedReports } = useReports()
  const count = confirmedReports.length
  const earnedBadges = BADGES.filter((b) => count >= b.threshold)

  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover"
    >
      <h2 className="font-display text-xl font-light text-[#1A1208] mb-1">Your Civic Impact</h2>
      <p className="text-sm text-[#7A6A58] mb-4">{count} report{count !== 1 ? "s" : ""} filed this session</p>
      <div className="flex flex-wrap gap-2">
        {earnedBadges.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#FAF7F2] border border-[#E8E4DB] rounded-full px-3 py-1.5">
            <span>{b.icon}</span>{b.label}
          </span>
        ))}
        {earnedBadges.length === 0 && (
          <span className="text-xs text-[#7A6A58] italic">File your first report to earn a badge</span>
        )}
      </div>
    </motion.div>
  )
}
