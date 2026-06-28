"use client"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"

const STACK = [
  { name: "Gemini 2.5 Flash", role: "AI Classification & Routing" },
  { name: "Google Search Grounding", role: "Live Severity Data" },
  { name: "URL Context Tool", role: "Department Policy Lookup" },
  { name: "Nominatim OSM", role: "Free Geocoding" },
  { name: "Leaflet + Clustering", role: "Interactive Live Map" },
  { name: "Cloud Run", role: "Zero-Config Deployment" },
  { name: "Framer Motion", role: "Premium Animations" },
  { name: "Next.js 16 + TypeScript", role: "App Framework" },
]

const STORY = [
  {
    step: "01",
    title: "The broken system",
    body: "In Hyderabad, a GHMC complaint filed on Twitter becomes a screenshot in a WhatsApp group, then a note in a ward officer's register that goes unread. 70% of civic complaints across Indian metros fail to reach the right department. The bottleneck is routing, not intent.",
  },
  {
    step: "02",
    title: "What we built",
    body: "One upload. Four AI steps: Gemini 2.5 Flash classifies the issue from the photo, checks for duplicates within 100 metres, assesses severity using live Google Search data (real SLAs, real backlogs), then drafts a formal report routed to the exact department with a full escalation chain.",
  },
  {
    step: "03",
    title: "Why it's different",
    body: "Most civic tech is a form builder. CivicPulse is a reasoning system. The severity score for a burst water main references HMWSSB's actual current response SLA from their website — not a static estimate. The grounding badge shows when live data was used. You can click the sources.",
  },
  {
    step: "04",
    title: "72 hours, open source",
    body: "Built in 72 hours for Vibe2Skill using Google AI Studio and Anthropic Claude Code. Every line runs on Google Cloud Run. Zero proprietary dependencies. MIT-licensed on GitHub.",
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
              Every day in India, thousands of civic complaints vanish into the wrong inbox.
            </h1>
            <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-[#7A6A58]">
              CivicPulse is an AI civic reporting platform built for the Vibe2Skill
              hackathon. It demonstrates that a single multimodal AI call can replace a
              broken multi-department complaint routing system — in real time.
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

      {/* Impact Numbers */}
      <section className="border-t border-[#E8E4DB] bg-[#0A1628]">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "30s", label: "Photo to routed report" },
              { value: "4", label: "AI pipeline steps" },
              { value: "14+", label: "Departments supported" },
              { value: "72h", label: "Built in" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl font-light text-white mb-1">
                  {stat.value}
                </p>
                <p className="font-mono text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-[#E8E4DB] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7A6A58] mb-3">
            Tech Stack
          </p>
          <h2 className="font-display text-3xl font-light text-[#1A1208] mb-10">
            Every capability intentionally chosen.
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
          <a
            href="/#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-[#1A1208]
            px-6 py-2.5 font-mono text-sm text-[#1A1208]
            hover:bg-[#1A1208] hover:text-white transition-colors"
          >
            How it works →
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
