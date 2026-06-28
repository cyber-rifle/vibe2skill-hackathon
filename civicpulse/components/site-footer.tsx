"use client"
import { motion } from "framer-motion"

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E8E4DB] bg-[#F2EDE4]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-14 md:flex-row md:items-center">
        <div>
          <p className="iridescent-text font-display text-2xl font-medium tracking-tight">
            CivicPulse
          </p>
          <p className="mt-2 font-sans text-sm text-[#7A6A58]">
            Built for India&apos;s communities.
          </p>
          <p className="mt-1 font-sans text-xs text-[#7A6A58]">
            Hyderabad, Telangana · 2026
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7A6A58]">
            Powered by Google AI Studio
          </p>
          <div className="flex gap-4 text-xs font-mono text-[#7A6A58]">
            <a href="/map" className="hover:text-[#1A1208] transition-colors">Map</a>
            <a href="/dashboard" className="hover:text-[#1A1208] transition-colors">Dashboard</a>
            <a href="#upload" className="hover:text-[#1A1208] transition-colors">Report</a>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 font-mono text-xs text-[#7A6A58]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5BBFBF] animate-pulse" />
            Live civic reporting · Open source
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
