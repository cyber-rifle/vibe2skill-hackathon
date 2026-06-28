"use client"
export function MapLegend() {
  const levels = [
    { color: '#5BBFBF', label: 'Low', description: 'Non-urgent' },
    { color: '#C9A84C', label: 'Medium', description: 'Standard' },
    { color: '#E8957A', label: 'High', description: 'Urgent' },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-[140px] rounded-xl border border-white/10 p-4 shadow-lg sm:bottom-auto sm:top-4 sm:max-w-none"
      style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(16px)' }}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/70"
        style={{ fontFamily: 'JetBrains Mono' }}>
        Severity
      </h3>
      <div className="space-y-2">
        {levels.map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-xs text-white/80">{l.label}</span>
            <span className="text-xs text-white/40">— {l.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
