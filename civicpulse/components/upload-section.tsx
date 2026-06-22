import { UploadCloud, MapPin } from "lucide-react"

const ANALYSIS_STEPS = [
  {
    label: "Classifying issue...",
    hint: "Identifying the category from the photo.",
  },
  {
    label: "Checking nearby reports...",
    hint: "Looking for duplicates within the area.",
  },
  {
    label: "Assessing severity...",
    hint: "Estimating urgency and public impact.",
  },
  {
    label: "Drafting report and routing...",
    hint: "Preparing the case for the right department.",
  },
]

export function UploadSection() {
  return (
    <section id="upload" className="mx-auto max-w-3xl px-5 pb-24">
      {/* Upload card with iridescent gradient border */}
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-2xl bg-card p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
            Submit a Report
          </p>
          <h2 className="mt-3 font-display text-3xl font-light text-ink">
            Show us what needs fixing
          </h2>

          {/* Drag-and-drop area */}
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal/50 bg-ivory-deep/40 px-6 py-12 text-center transition-colors hover:border-teal">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
              <UploadCloud className="h-6 w-6 text-teal" aria-hidden="true" />
            </div>
            <p className="mt-4 font-sans text-sm font-medium text-ink">
              Drag and drop a photo, or click to browse
            </p>
            <p className="mt-1 font-sans text-xs text-ink-muted">
              JPG or PNG, up to 10MB
            </p>
          </div>

          {/* Location input */}
          <div className="mt-5">
            <label
              htmlFor="location"
              className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted"
            >
              Location
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                id="location"
                type="text"
                placeholder="Enter address or drop a pin"
                className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            className="shimmer-btn mt-6 w-full rounded-full px-6 py-3 font-sans text-sm font-medium shadow-sm"
          >
            Analyze Issue
          </button>
        </div>
      </div>

      {/* Agent Analysis container */}
      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">
          Agent Analysis
        </p>

        <ol className="mt-5 flex flex-col gap-3">
          {ANALYSIS_STEPS.map((step, index) => (
            <li
              key={step.label}
              className="flex items-start gap-4 rounded-xl border border-border border-l-4 border-l-teal bg-ivory-deep px-5 py-4"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-ink-muted">
                {index + 1}
              </span>
              <div>
                <p className="font-mono text-sm text-teal">{step.label}</p>
                <p className="mt-1 font-sans text-xs text-ink-muted">
                  {step.hint}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
