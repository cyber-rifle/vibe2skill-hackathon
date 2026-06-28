'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  onClose: () => void
  initialLat?: number
  initialLng?: number
}

export function MapPicker({ onLocationSelect, onClose, initialLat = 20.5937, initialLng = 78.9629 }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markerInstance = useRef<L.Marker | null>(null)
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    if (!mapInstance.current) {
      // Fix marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      mapInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], 5)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current)

      mapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng
        setSelectedCoords({ lat, lng })
        
        if (markerInstance.current) {
          markerInstance.current.setLatLng(e.latlng)
        } else {
          markerInstance.current = L.marker(e.latlng).addTo(mapInstance.current!)
        }
      })
      
      // Invalidating size helps if map is rendered in a modal
      setTimeout(() => {
        mapInstance.current?.invalidateSize()
      }, 100)
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [initialLat, initialLng])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E8E4DB] flex justify-between items-center bg-[#FAF7F2]">
          <h3 className="font-display text-lg font-light text-[#1A1208]">Pick Location</h3>
          <button onClick={onClose} className="text-[#7A6A58] hover:text-black">
            ✕
          </button>
        </div>
        <div className="relative h-[60vh] w-full">
          <div ref={mapRef} className="absolute inset-0 z-10" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white px-4 py-2 rounded-full shadow-sm border border-[#E8E4DB] pointer-events-none">
            <p className="font-mono text-xs text-[#7A6A58]">Tap anywhere on the map to place pin</p>
          </div>
        </div>
        <div className="p-4 border-t border-[#E8E4DB] flex justify-end gap-3 bg-[#FAF7F2]">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#E8E4DB] text-[#7A6A58] hover:bg-[#F0EBE3] transition-colors">
            Cancel
          </button>
          <button 
            disabled={!selectedCoords}
            onClick={() => {
              if (selectedCoords) onLocationSelect(selectedCoords.lat, selectedCoords.lng)
            }} 
            className="px-6 py-2 shimmer-btn rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  )
}
