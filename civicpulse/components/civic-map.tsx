'use client'

import { useEffect, useRef, useState } from 'react'
import type { CivicReport } from '@/lib/seed-reports'

interface CivicMapProps {
  reports: CivicReport[]
  selectedId: string | null
  onMarkerClick: (id: string) => void
  onInvalidateSize?: () => void
}

const severityColor: Record<string, string> = {
  low: '#5BBFBF',
  medium: '#D4AF37',
  high: '#E8957A',
}

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
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const clusterRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const initStartedRef = useRef(false)
  const onMarkerClickRef = useRef(onMarkerClick)
  const prevLengthRef = useRef(reports.length)

  const [darkMap, setDarkMap] = useState(false)
  const [showHeat, setShowHeat] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return
    if (initStartedRef.current) return
    initStartedRef.current = true

    // Load Leaflet and plugins via script injection so they all patch window.L
    const loadLeaflet = async () => {
      // Step 1: load leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      if (!document.querySelector('link[href*="MarkerCluster"]')) {
        const link1 = document.createElement('link')
        link1.rel = 'stylesheet'
        link1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'
        document.head.appendChild(link1)
        const link2 = document.createElement('link')
        link2.rel = 'stylesheet'
        link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'
        document.head.appendChild(link2)
      }

      // Step 2: load Leaflet core JS via import (it patches window.L)
      await import('leaflet')
      const L = (window as any).L
      if (!L) return

      // Step 3: load plugins — they patch window.L
      if (!(window as any).L.markerClusterGroup) {
        await import('leaflet.markercluster' as any)
      }
      if (!(window as any).L.heatLayer) {
        await import('leaflet.heat' as any)
      }

      if (!containerRef.current || mapRef.current) return

      const initialCenter: [number, number] = reports.length > 0 
        ? [reports[0].lat, reports[0].lon] 
        : [20.5937, 78.9629] // India center
      
      const map = L.map(containerRef.current, { zoomControl: true }).setView(initialCenter, 12)
      mapRef.current = map
      setMapReady(true)
      setTimeout(() => map.invalidateSize(), 100)

      const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      tileLayerRef.current = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)

      // Inject popup styles once
      const style = document.createElement('style')
      style.textContent = `
        .leaflet-popup-content-wrapper {
          background: #ffffff !important;
          border: 1px solid #E8E4DB !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 24px rgba(26,18,8,0.10) !important;
          padding: 14px 16px !important;
        }
        .leaflet-popup-tip { background: #ffffff !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-close-button { color: #7A6A58 !important; font-size: 16px !important; top: 8px !important; right: 10px !important; }
      `
      document.head.appendChild(style)

      setMapReady(true)
    }

    loadLeaflet()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current = {}
      clusterRef.current = null
      heatLayerRef.current = null
      tileLayerRef.current = null
      initStartedRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Dark map tile swap
  useEffect(() => {
    if (!mapReady || !mapRef.current || !tileLayerRef.current) return
    const L = (window as any).L
    if (!L) return
    tileLayerRef.current.remove()
    const tileUrl = darkMap
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current)
  }, [darkMap, mapReady])

  // Heatmap toggle
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const L = (window as any).L
    if (!L) return
    if (heatLayerRef.current) {
      heatLayerRef.current.remove()
      heatLayerRef.current = null
    }
    if (showHeat && reports.length > 0) {
      const severityNum: Record<string, number> = { low: 1, medium: 3, high: 5 }
      const heatData = reports.map((r) => [
        r.lat, r.lon,
        Math.min(1, (severityNum[r.severity] ?? 3) / 5 + 0.35)
      ])
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 45,
        blur: 20,
        maxZoom: 17,
        minOpacity: 0.5,
        gradient: { 0.0: '#5BBFBF', 0.5: '#D4AF37', 1.0: '#E8957A' },
      })
      heatLayerRef.current.addTo(mapRef.current)
    }
  }, [showHeat, reports, mapReady])

  // Build/rebuild markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const L = (window as any).L
    if (!L || !L.markerClusterGroup) return

    if (clusterRef.current) {
      clusterRef.current.remove()
      clusterRef.current = null
    }
    markersRef.current = {}

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction: (c: any) =>
        L.divIcon({
          html: `<div style="background:${
            c.getChildCount() >= 5 ? '#E8957A' : c.getChildCount() >= 3 ? '#D4AF37' : '#5BBFBF'
          };color:white;border-radius:50%;width:40px;height:40px;
          display:flex;align-items:center;justify-content:center;
          font-family:monospace;font-size:14px;font-weight:700;
          border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.25)">
            ${c.getChildCount()}
          </div>`,
          className: '',
          iconSize: [40, 40],
        }),
    })
    clusterRef.current = cluster

    const isNewBatch = reports.length > prevLengthRef.current
    const newestId = isNewBatch ? reports[reports.length - 1]?.id : null
    prevLengthRef.current = reports.length

    reports.forEach((r) => {
      const isSelected = r.id === selectedId

      const marker = L.circleMarker([r.lat, r.lon], {
        radius: isSelected ? 20 : 16,
        fillColor: severityColor[r.severity] ?? '#5BBFBF',
        color: isSelected ? '#1A1208' : '#ffffff',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.95,
      }).bindPopup(
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

      // Pulse animation for newest marker
      if (r.id === newestId && mapRef.current) {
        const pulseCircle = L.circle([r.lat, r.lon], {
          radius: 30,
          color: severityColor[r.severity] ?? '#5BBFBF',
          fillColor: severityColor[r.severity] ?? '#5BBFBF',
          fillOpacity: 0.4,
          weight: 2,
          opacity: 0.8,
        }).addTo(mapRef.current)

        let frame = 0
        const pulseInterval = setInterval(() => {
          frame++
          const t = (frame % 30) / 30
          pulseCircle.setRadius(30 * (1 + t * 2))
          pulseCircle.setStyle({ opacity: 0.5 * (1 - t), fillOpacity: 0.3 * (1 - t) })
          if (frame >= 90) {
            clearInterval(pulseInterval)
            pulseCircle.remove()
          }
        }, 33)
      }

      cluster.addLayer(marker)
    })

    mapRef.current.addLayer(cluster)

    // Removed the popup logic from here, moving it to a separate useEffect
  }, [reports, mapReady])

  useEffect(() => {
    if (!mapReady || !selectedId) return;
    const r = reports.find((rep) => rep.id === selectedId);
    if (!r || !mapRef.current) return;

    mapRef.current.setView([r.lat, r.lon], Math.max(mapRef.current.getZoom(), 14), {
      animate: true,
      duration: 0.5,
    });

    setTimeout(() => {
      const marker = markersRef.current[selectedId];
      if (!marker) return;
      if (clusterRef.current?.zoomToShowLayer) {
        clusterRef.current.zoomToShowLayer(marker, () => {
          setTimeout(() => marker.openPopup(), 100);
        });
      } else {
        marker.openPopup();
      }
    }, 500);
  }, [reports, selectedId, mapReady])

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={containerRef} className="h-full w-full" />

      <button
        onClick={() => setDarkMap(!darkMap)}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}
        className="text-xs font-mono bg-white border border-[#E8E4DB] rounded-full px-3 py-1 shadow hover:bg-[#FAF7F2] transition-colors"
      >
        {darkMap ? '☀️ Light' : '🌙 Dark'}
      </button>

      <button
        onClick={() => setShowHeat(!showHeat)}
        style={{ position: 'absolute', top: 44, right: 10, zIndex: 1000 }}
        className="text-xs font-mono bg-white border border-[#E8E4DB] rounded-full px-3 py-1 shadow hover:bg-[#FAF7F2] transition-colors"
      >
        {showHeat ? '🗺 Hide Heat' : '🔥 Heatmap'}
      </button>
    </div>
  )
}
