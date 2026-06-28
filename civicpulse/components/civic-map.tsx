'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { CivicReport } from '@/lib/seed-reports'

interface CivicMapProps {
  reports: CivicReport[]
  selectedId: string | null
  onMarkerClick: (id: string) => void
}

const severityColor: Record<string, string> = {
  low: '#5BBFBF',
  medium: '#C9A84C',
  high: '#E8957A',
}

// Feature 7 — Lifecycle timeline HTML builder
function buildTimelineHtml(status: string): string {
  const stages = ['Reported', 'Acknowledged', 'In Progress', 'Resolved']
  const statusKeys = ['reported', 'acknowledged', 'in_progress', 'resolved']
  const activeIdx = statusKeys.indexOf(status ?? 'reported')
  const pills = stages
    .map((s, i) => {
      const bg = i <= activeIdx ? '#5BBFBF' : '#E8E4DB'
      const color = i <= activeIdx ? 'white' : '#7A6A58'
      const pill = `<span style="font-size:10px;font-family:monospace;padding:2px 8px;border-radius:999px;background:${bg};color:${color};white-space:nowrap">${s}</span>`
      return i < stages.length - 1
        ? pill + `<span style="color:#7A6A58;font-size:10px;margin:0 2px">→</span>`
        : pill
    })
    .join('')
  return `<div style="display:flex;align-items:center;gap:2px;margin-top:8px;flex-wrap:wrap">${pills}</div>`
}

export function CivicMap({ reports, selectedId, onMarkerClick }: CivicMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<Record<string, any>>({})
  const clusterRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const styleInjectedRef = useRef(false)
  const onMarkerClickRef = useRef(onMarkerClick)
  const prevLengthRef = useRef(reports.length)

  // Feature 14 — Dark map state
  const [darkMap, setDarkMap] = useState(false)
  // Feature 11 — Heatmap state
  const [showHeat, setShowHeat] = useState(false)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  useEffect(() => {
    if (!containerRef.current) return

    import('leaflet').then((L) => {
      if (mapRef.current) return

      const map = L.map(containerRef.current!).setView([17.4474, 78.3762], 12)
      mapRef.current = map

      const tileUrl = darkMap
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      setTimeout(() => {
        containerRef.current?.dispatchEvent(new CustomEvent('mapready'))
      }, 0)

      if (!styleInjectedRef.current) {
        styleInjectedRef.current = true
        const style = document.createElement('style')
        style.textContent = `
          .leaflet-popup-content-wrapper {
            background: #ffffff !important;
            border: 1px solid #E8E4DB !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 24px rgba(26,18,8,0.10) !important;
            padding: 14px 16px !important;
          }
          .leaflet-popup-tip { background: #ffffff !important; }
          .leaflet-popup-content { margin: 0 !important; }
          .leaflet-popup-close-button {
            color: #7A6A58 !important;
            font-size: 16px !important;
            top: 8px !important;
            right: 10px !important;
          }
        `
        document.head.appendChild(style)
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
      clusterRef.current = null
      heatLayerRef.current = null
      tileLayerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Feature 14 — Swap tile layer when darkMap changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return
      tileLayerRef.current.remove()
      const tileUrl = darkMap
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current!)
    })
  }, [darkMap])

  // Feature 11 — Toggle heatmap
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('leaflet.heat')
      const L = (window as any).L ?? require('leaflet')
      if (!mapRef.current) return
      if (heatLayerRef.current) {
        heatLayerRef.current.remove()
        heatLayerRef.current = null
      }
      if (showHeat && reports.length > 0) {
        const severityNum: Record<string, number> = { low: 1, medium: 3, high: 5 }
        const heatData = reports.map((r) => [r.lat, r.lon, (severityNum[r.severity] ?? 3) / 5])
        heatLayerRef.current = (L as any).heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 15,
          gradient: { 0.4: '#5BBFBF', 0.65: '#D4AF37', 1.0: '#E8957A' },
        })
        heatLayerRef.current.addTo(mapRef.current!)
      }
    })
  }, [showHeat, reports]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function buildMarkers() {
      import('leaflet').then((L) => {
        if (!mapRef.current) return

        // Feature 8 — Remove previous cluster layer
        if (clusterRef.current) {
          clusterRef.current.remove()
          clusterRef.current = null
        }
        markersRef.current = {}

        // Feature 8 — Load markercluster dynamically
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('leaflet.markercluster')

        const cluster = (L as any).markerClusterGroup({
          maxClusterRadius: 60,
          iconCreateFunction: (c: any) =>
            (L as any).divIcon({
              html: `<div style="background:#5BBFBF;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:13px;font-weight:600;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)">${c.getChildCount()}</div>`,
              className: '',
              iconSize: [36, 36],
            }),
        })
        clusterRef.current = cluster

        const isNewBatch = reports.length > prevLengthRef.current
        const newestId = isNewBatch ? reports[reports.length - 1]?.id : null
        prevLengthRef.current = reports.length

        reports.forEach((r) => {
          const isSelected = r.id === selectedId
          const isNewest = r.id === newestId

          // Feature 6 — Pulse class on newest marker
          const markerClass = isNewest ? 'marker-pulse' : ''

          const marker = (L as any).circleMarker([r.lat, r.lon], {
            radius: isSelected ? 14 : 10,
            fillColor: severityColor[r.severity],
            color: isSelected ? '#1A1208' : '#fff',
            weight: isSelected ? 3 : 2,
            opacity: 1,
            fillOpacity: 0.9,
            className: markerClass,
          })
            .bindPopup(
              `<div style="font-family:'DM Sans',sans-serif;min-width:190px;padding:4px 2px">
                <div style="font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7A6A58;margin-bottom:6px;font-family:'JetBrains Mono',monospace">${r.category.replace(/_/g, ' ')}</div>
                <div style="font-size:14px;font-weight:600;color:#1A1208;margin-bottom:6px;line-height:1.3">${r.department}</div>
                ${r.resolutionTimeEstimate
                  ? `<div style="font-size:11px;color:#1A1208;margin-bottom:8px"><span style="color:#7A6A58">Expected resolution:</span> <strong>${r.resolutionTimeEstimate}</strong></div>`
                  : '<div style="font-size:11px;color:#7A6A58;margin-bottom:8px;font-style:italic">Timeline varies by department</div>'}
                <div style="font-size:12px;color:#7A6A58;line-height:1.6;margin-bottom:10px;border-top:1px solid #E8E4DB;padding-top:8px">${r.description}</div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:#FAF7F2;border:1px solid #E8E4DB;border-radius:4px;padding:2px 7px;color:#1A1208;font-weight:500">severity ${r.severity}</span>
                  <span style="font-size:10px;font-family:'JetBrains Mono',monospace;background:#FAF7F2;border:1px solid #E8E4DB;border-radius:4px;padding:2px 7px;color:#7A6A58">${(r.status ?? 'reported').replace(/_/g, ' ')}</span>
                </div>
                ${buildTimelineHtml(r.status ?? 'reported')}
              </div>`,
              { maxWidth: 280 }
            )

          marker.on('click', () => onMarkerClickRef.current(r.id))
          markersRef.current[r.id] = marker
          cluster.addLayer(marker)

          // Feature 6 — Remove pulse class after 3s
          if (isNewest) {
            setTimeout(() => {
              const el = marker.getElement?.()
              if (el) el.classList.remove('marker-pulse')
            }, 3000)
          }
        })

        mapRef.current!.addLayer(cluster)

        if (selectedId && markersRef.current[selectedId]) {
          const r = reports.find((rep) => rep.id === selectedId)
          if (r && mapRef.current) {
            mapRef.current.setView([r.lat, r.lon], mapRef.current.getZoom(), {
              animate: true,
              duration: 0.3,
              easeLinearity: 0.5,
            })
            setTimeout(() => markersRef.current[selectedId]?.openPopup(), 150)
          }
        }
      })
    }

    if (mapRef.current) {
      buildMarkers()
      return
    }

    const container = containerRef.current
    container?.addEventListener('mapready', buildMarkers, { once: true })
    return () => container?.removeEventListener('mapready', buildMarkers)
  }, [reports, selectedId])

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Feature 14 — Dark mode toggle button */}
      <button
        onClick={() => setDarkMap(!darkMap)}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
        className="text-xs font-mono bg-white border border-[#E8E4DB] rounded-full px-3 py-1 shadow hover:bg-[#FAF7F2] transition-colors"
      >
        {darkMap ? '☀️ Light Map' : '🌙 Dark Map'}
      </button>

      {/* Feature 11 — Heatmap toggle button */}
      <button
        onClick={() => setShowHeat(!showHeat)}
        style={{ position: 'absolute', top: 44, right: 10, zIndex: 1000 }}
        className="text-xs font-mono bg-white border border-[#E8E4DB] rounded-full px-3 py-1 shadow hover:bg-[#FAF7F2] transition-colors"
      >
        {showHeat ? '🗺 Hide Heatmap' : '🔥 Show Heatmap'}
      </button>
    </div>
  )
}
