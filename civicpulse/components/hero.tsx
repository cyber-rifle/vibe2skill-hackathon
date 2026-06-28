"use client"
import { MapIcon } from "lucide-react"
import { motion } from "framer-motion"
import StatCounter from "@/components/StatCounter"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A1628] hero-grain">
      {/* Ambient orb — top right */}
      <div aria-hidden="true" className="ambient-orb absolute -right-40 -top-40
        h-[42rem] w-[42rem] opacity-[0.22]" />
      {/* Ambient orb — bottom left */}
      <div aria-hidden="true" className="ambient-orb absolute -left-32 bottom-0
        h-[32rem] w-[32rem] opacity-[0.12]"
        style={{ background: 'linear-gradient(135deg,#E8957A,#D4AF6A)' }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-24 md:pb-32 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border
            border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5BBFBF] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF]">
              Powered by Google AI Studio
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-6xl md:text-[80px] lg:text-[96px] font-light
            leading-[0.95] tracking-tight text-white text-balance">
            Report it.{" "}
            <span className="gradient-text italic">Watch it act.</span>
          </h1>

          <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-white/60">
            Every day, broken streetlights, overflowing drains, and crumbling roads go
            unresolved because reports vanish into the wrong inbox. CivicPulse turns a
            single photo into a routed, actionable case — in under 30 seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#upload"
              className="shimmer-btn rounded-full px-8 py-3.5 font-sans text-sm font-semibold shadow-lg">
              Report an Issue
            </a>
            <a href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-white/20
              bg-white/5 px-8 py-3.5 font-sans text-sm font-medium text-white
              backdrop-blur-sm transition-all hover:bg-white/10">
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              View the Map
            </a>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 flex flex-wrap gap-12"
        >
          <div className="iridescent-border rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={1240} suffix="+" label="Issues Reported"
                duration={1600} liveReportCount={true} darkMode={true} />
            </div>
          </div>
          <div className="iridescent-border rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={89} suffix="%" label="Resolved in 7 Days"
                duration={1800} darkMode={true} />
            </div>
          </div>
          <div className="iridescent-border rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={14} suffix="+" label="Departments Linked"
                duration={1400} darkMode={true} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
