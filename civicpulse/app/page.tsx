"use client"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { UploadSection } from "@/components/upload-section"
import { SiteFooter } from "@/components/site-footer"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      {/* Feature 18 — divider with iridescent gradient line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-5"
      >
        <div className="h-px w-full iridescent origin-left" />
      </motion.div>
      {/* Bento Features Grid */}
      <section id="how-it-works" className="relative overflow-hidden bg-white">
        <div aria-hidden="true" className="ambient-orb absolute right-0 top-1/2 -translate-y-1/2
          h-[40rem] w-[40rem] opacity-[0.06]" />
        <div className="relative mx-auto max-w-6xl px-5 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF] mb-3">
              How it works
            </p>
            <h2 className="font-display text-5xl font-light text-[#1A1208]">
              Four steps. One photo.
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[160px]">

            {/* Large card — Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="bento-card md:col-span-5 md:row-span-2 p-8 flex flex-col justify-between
              bg-gradient-to-br from-[#0A1628] to-[#0F2137] text-white relative overflow-hidden"
            >
              <div aria-hidden="true" className="ambient-orb absolute -right-8 -top-8
                h-40 w-40 opacity-[0.35]" />
              <span className="font-mono text-4xl font-light text-white/20">01</span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#5BBFBF] mb-2">
                  Classify
                </p>
                <h3 className="font-display text-3xl font-light text-white mb-2">
                  AI reads your photo
                </h3>
                <p className="font-sans text-sm leading-relaxed text-white/60">
                  Gemini 2.5 Flash identifies the issue type — pothole, leaking pipe,
                  broken streetlight — directly from the image. No text description needed.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bento-card md:col-span-4 p-6 flex flex-col justify-between bg-[#FAF7F2]"
            >
              <span className="font-mono text-3xl font-light text-[#E8E4DB]">02</span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#5BBFBF] mb-1">
                  Deduplicate
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1A1208]">
                  No duplicate reports
                </h3>
                <p className="font-sans text-xs leading-relaxed text-[#7A6A58] mt-1">
                  Checks reports within 200m for the same issue type before submitting.
                </p>
              </div>
            </motion.div>

            {/* Step 3 — severity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.15 }}
              className="bento-card md:col-span-3 p-6 flex flex-col justify-between
              overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg,#5BBFBF15,#D4AF6A15)' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-light text-[#E8E4DB]">03</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-6 w-1.5 rounded-full"
                      style={{ background: i<=4 ? '#E8957A' : '#E8E4DB' }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#5BBFBF] mb-1">
                  Severity
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1A1208]">
                  Live grounding
                </h3>
                <p className="font-sans text-xs text-[#7A6A58] mt-1">
                  Google Search confirms real-world context. A flooded road gets a 5/5.
                </p>
              </div>
            </motion.div>

            {/* Step 4 — route */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bento-card md:col-span-4 p-6 flex flex-col justify-between"
            >
              <span className="font-mono text-3xl font-light text-[#E8E4DB]">04</span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#E8957A] mb-1">
                  Route
                </p>
                <h3 className="font-sans text-lg font-semibold text-[#1A1208]">
                  Right department, first time
                </h3>
                <p className="font-sans text-xs leading-relaxed text-[#7A6A58] mt-1">
                  GHMC, HMWSSB, Electrical — routed automatically with escalation chain.
                </p>
              </div>
            </motion.div>

            {/* Wide card — map preview pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.25 }}
              className="bento-card md:col-span-3 p-6 flex flex-col items-start justify-between
              bg-[#0A1628] text-white"
            >
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#5BBFBF]">Live</p>
              <div>
                <h3 className="font-display text-2xl font-light mb-2">Community map</h3>
                <a href="/map" className="font-mono text-xs text-[#D4AF6A] hover:underline">
                  View all reports →
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <section id="upload" className="relative overflow-hidden py-20 bg-[#FAF7F2]">
        {/* Ambient orb decorations */}
        <div aria-hidden="true" className="ambient-orb absolute -right-32 top-10
          h-72 w-72 opacity-[0.08]" />
        <div aria-hidden="true" className="ambient-orb absolute -left-24 bottom-10
          h-56 w-56 opacity-[0.06]"
          style={{ background: 'linear-gradient(135deg,#E8957A,#D4AF6A)' }} />
        <div className="relative z-10 mx-auto max-w-3xl px-5">
          <UploadSection />
        </div>
      </section>
      {/* Feature 18 — floating map CTA that appears after scroll */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-5 pb-20 text-center"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#7A6A58] mb-4">
          Already reported? Track it.
        </p>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-full border border-[#1A1208] bg-transparent px-8 py-3 font-sans text-sm font-medium text-[#1A1208] transition-colors hover:bg-[#1A1208] hover:text-white"
        >
          🗺 View Community Map
        </Link>
      </motion.div>
      <SiteFooter />
    </main>
  )
}