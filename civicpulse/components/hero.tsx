import { MapIcon } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Iridescent orb decoration */}
      <div
        aria-hidden="true"
        className="iridescent pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF]">
            Powered by Google AI Studio
          </p>

          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-balance text-[#1A1208] md:text-[64px]">
            Report it. Watch it <span className="italic">act</span>.
          </h1>

          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-[#7A6A58]">
            Every day, broken streetlights, overflowing drains, and crumbling
            roads go unresolved because reports vanish into the wrong inbox.
            CivicPulse turns a single photo into a routed, actionable case.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#upload"
              className="shimmer-btn rounded-full px-7 py-3 font-sans text-sm font-medium shadow-sm"
            >
              Report an Issue
            </a>
            <a
              href="/map"
              className="inline-flex items-center gap-2 rounded-full border border-[#1A1208] bg-transparent px-7 py-3 font-sans text-sm font-medium text-[#1A1208] transition-colors hover:bg-[#1A1208] hover:text-[#FAF7F2]"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              View the Map
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
