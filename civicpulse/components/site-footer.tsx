export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ivory-deep">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-12 md:flex-row md:items-center">
        <div>
          <p className="iridescent-text font-display text-2xl font-medium">
            CivicPulse
          </p>
          <p className="mt-2 font-sans text-sm text-ink-muted">
            Built for India&apos;s communities
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
          Powered by Google AI Studio
        </p>
      </div>
    </footer>
  )
}
