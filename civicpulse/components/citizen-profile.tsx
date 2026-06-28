"use client"
import { useReports } from "@/lib/report-context"
import { motion } from "framer-motion"

const BADGES = [
  { threshold: 1, label: "First Report", icon: "🌱" },
  { threshold: 3, label: "Active Citizen", icon: "🏙️" },
  { threshold: 5, label: "Neighborhood Watch", icon: "👁️" },
  { threshold: 10, label: "Civic Champion", icon: "🏆" },
]

interface CitizenProfileProps {
  dark?: boolean // Deprecated, kept for interface compat
}

export function CitizenProfile({ dark }: CitizenProfileProps) {
  const { confirmedReports } = useReports()
  const count = confirmedReports.length
  const earnedBadges = BADGES.filter((b) => count >= b.threshold)

  if (count === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white"
    >
      <h2 className="font-display text-xl font-light mb-1 text-[#1A1208]">
        Your Civic Impact
      </h2>
      <p className="text-sm mb-4 text-[#7A6A58]">
        {count} report{count !== 1 ? "s" : ""} filed this session
      </p>
      <div className="flex flex-wrap gap-2">
        {earnedBadges.map((b) => (
          <span key={b.label}
            className="inline-flex items-center gap-1.5 text-xs font-mono rounded-full px-3 py-1.5 border bg-[#FAF7F2] border-[#E8E4DB] text-[#1A1208]">
            <span>{b.icon}</span>{b.label}
          </span>
        ))}
        {earnedBadges.length === 0 && (
          <span className="text-xs italic text-[#7A6A58]">
            File your first report to earn a badge
          </span>
        )}
      </div>
    </motion.div>
  )
}
