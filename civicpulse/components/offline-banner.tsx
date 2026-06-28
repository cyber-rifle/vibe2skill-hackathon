"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[10000] bg-[#E8957A] text-white text-center text-sm font-mono py-2"
        >
          ⚠ You're offline — analysis and map sync will resume when reconnected
        </motion.div>
      )}
    </AnimatePresence>
  )
}
