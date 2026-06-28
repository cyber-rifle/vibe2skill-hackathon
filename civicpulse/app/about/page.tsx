"use client"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"

const STACK = [
  { name: "Next.js 16", role: "Framework" },
  { name: "Google Gemini 2.5 Flash", role: "AI Analysis" },
  { name: "Google Cloud Run", role: "Deployment" },
  { name: "Leaflet + Clustering", role: "Interactive Map" },
  { name: "Framer Motion", role: "Animations" },
  { name: "Nominatim OSM", role: "Geocoding" },
  { name: "Tailwind CSS v4", role: "Styling" },
  { name: "TypeScript", role: "Type Safety" },
]

const STORY = [
  {
    step: "01",
    title: "The problem",
    body: "Hyderabad generates thousands of civic complaints daily. A broken streetlight reported to GHMC on Twitter becomes a PDF in someone's email which becomes an entry in a spreadsheet that no one checks. Reports vanish. Nothing gets fixed.",
  },
  {
    step: "02",
    title: "Our approach",
    body: "One photo. Four AI steps: classify the issue type, check for duplicates nearby, assess severity with live Google Search grounding, draft a formal report routed to the exact department responsible.",
  },
  {
    step: "03",
    title: "Why it works",
    body: "Gemini 2.5 Flash's multimodal understanding means the AI actually looks at the photo — not just reads a text description. Google Search grounding means severity scores reflect current conditions, not just training data.",
  },
  {
    step: "04",
    title: "Built for the hackathon",
    body: "CivicPulse was built for the Vibe2Skill hackathon in 72 hours using Google AI Studio and Claude Code. Every line of infrastructure runs on Google Cloud. The entire codebase is open source.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8E4DB]">
        <div className="pointer-events-none absolute -left-32 top-20 h-[28rem] w-[28rem]
          rounded-full opacity-[0.10] blur-3xl"
          style={{ background: 'linear-gradient(135deg,#E8957A,#D4AF6A,#5BBFBF)' }}
        />
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF] mb-4">
              The Project
            </p>
            <h1 className="font-display text-5xl md:text-[60px] font-light leading-[1.05]
              tracking-tight text-[#1A1208]">
              Built for Hyderabad.<br />
              <span className="italic">Designed for every city.</span>
            </h1>
            <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-[#7A6A58]">
              CivicPulse is an open-source AI civic reporting platform built during the
              Vibe2Skill hackathon. It demonstrates what's possible when multimodal AI
              meets local government infrastructure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story steps */}
      <section className="mx-auto max-w-4xl px-5 py-20">
        <div className="space-y-12">
          {STORY.map((s, i) => (
            <motion.div key={s.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-8 items-start border-b border-[#E8E4DB] pb-12 last:border-0">
              <span className="font-mono text-xs text-[#5BBFBF] shrink-0 mt-1 w-8">{s.step}</span>
              <div>
                <h3 className="font-display text-2xl font-light text-[#1A1208] mb-2">{s.title}</h3>
                <p className="font-sans text-base leading-relaxed text-[#7A6A58]">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-[#E8E4DB] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7A6A58] mb-3">
            Tech Stack
          </p>
          <h2 className="font-display text-3xl font-light text-[#1A1208] mb-10">
            Powered by Google's ecosystem.
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STACK.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[#E8E4DB] p-4 card-hover bg-[#FAF7F2]">
                <p className="font-mono text-xs text-[#5BBFBF] mb-1">{t.role}</p>
                <p className="font-sans text-sm font-medium text-[#1A1208]">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="border-t border-[#E8E4DB]">
        <div className="mx-auto max-w-4xl px-5 py-16 flex flex-wrap gap-4">
          <a href="https://github.com/cyber-rifle/vibe2skill-hackathon" target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#1A1208]
            px-6 py-2.5 font-mono text-sm text-[#1A1208] hover:bg-[#1A1208] hover:text-white
            transition-colors">
            View on GitHub →
          </a>
          <a href="/for-cities"
            className="shimmer-btn rounded-full px-6 py-2.5 font-mono text-sm">
            For Cities
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
