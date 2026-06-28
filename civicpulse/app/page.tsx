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
      <UploadSection />
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