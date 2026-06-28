"use client"
import { Navbar } from "@/components/navbar"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"

const FEATURES = [
  {
    icon: "🗺",
    title: "Real-Time Issue Map",
    body: "Every citizen report pinned on a live map, clustered by severity and department. Your operations team sees Hyderabad's pain points the moment they're reported.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Routing",
    body: "Gemini 2.5 Flash classifies, prioritises, and routes each report to the right department automatically — no manual triage, no lost tickets.",
  },
  {
    icon: "📊",
    title: "Civic Intelligence Dashboard",
    body: "Category breakdowns, resolution rates, and severity distributions in a single dashboard. Make budget decisions with data, not guesswork.",
  },
  {
    icon: "⚡",
    title: "Escalation Engine",
    body: "High-severity issues automatically surface to senior officials. Urgent potholes reach the Commissioner, not just the ward office.",
  },
  {
    icon: "🏙",
    title: "Built for Indian Cities",
    body: "Designed around GHMC, HMWSSB, and Telangana's departmental structure. Works out-of-the-box for any Tier 1 or Tier 2 Indian city.",
  },
  {
    icon: "🔒",
    title: "No New Infrastructure",
    body: "Cloud Run deployment. No servers to manage, no databases to provision. Scales from 100 to 100,000 reports without configuration.",
  },
]

const STATS = [
  { value: "4-step", label: "AI Analysis Pipeline" },
  { value: "<30s", label: "Report to Routing" },
  { value: "14+", label: "Departments Supported" },
  { value: "100%", label: "Open Source" },
]

export default function ForCitiesPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E8E4DB]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem]
          rounded-full opacity-[0.12] blur-3xl"
          style={{ background: 'linear-gradient(135deg,#5BBFBF,#D4AF6A,#E8957A)' }}
        />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF] mb-4">
              For Municipal Corporations
            </p>
            <h1 className="font-display text-5xl md:text-[64px] font-light leading-[1.05]
              tracking-tight text-[#1A1208] text-balance">
              Civic intelligence for the cities that run India.
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#7A6A58]">
              CivicPulse turns unstructured citizen complaints into structured, routed,
              trackable civic reports — powered by Google AI Studio, deployed on Cloud Run,
              and built for the speed of Indian governance.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="mailto:contact@civicpulse.in"
                className="shimmer-btn rounded-full px-8 py-3 font-sans text-sm font-medium">
                Request a Demo
              </a>
              <a href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#1A1208]
                px-8 py-3 font-sans text-sm font-medium text-[#1A1208]
                hover:bg-[#1A1208] hover:text-white transition-colors">
                See Live Dashboard →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[#E8E4DB] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}>
              <p className="font-display text-4xl font-light text-[#1A1208]">{s.value}</p>
              <p className="mt-1 font-mono text-xs text-[#7A6A58]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7A6A58] mb-3">
          What cities get
        </p>
        <h2 className="font-display text-4xl font-light text-[#1A1208] mb-12">
          Everything a modern civic office needs.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-[#E8E4DB] bg-white p-6 card-hover">
              <p className="text-3xl mb-4">{f.icon}</p>
              <h3 className="font-sans text-base font-semibold text-[#1A1208] mb-2">{f.title}</h3>
              <p className="font-sans text-sm leading-relaxed text-[#7A6A58]">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#E8E4DB] bg-[#1A1208] text-[#FAF7F2]">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <h2 className="font-display text-4xl font-light mb-4">
            Ready to bring CivicPulse to your city?
          </h2>
          <p className="font-sans text-[#7A6A58] mb-8 max-w-lg mx-auto">
            CivicPulse is open source and free to deploy. Municipal teams can be live in under an hour.
          </p>
          <a href="mailto:contact@civicpulse.in"
            className="shimmer-btn rounded-full px-10 py-3 font-sans text-sm font-medium">
            Get in Touch
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
