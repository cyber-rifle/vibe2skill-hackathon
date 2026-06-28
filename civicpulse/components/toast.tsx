"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback, createContext, useContext } from "react"

type Toast = { id: string; message: string; type: "success" | "error" | "info" }
type ToastContextType = { addToast: (message: string, type?: Toast["type"]) => void }

const ToastContext = createContext<ToastContextType>({ addToast: () => {} })
export const useToast = () => useContext(ToastContext)

const colors: Record<Toast["type"], string> = {
  success: "#5BBFBF",
  error: "#E8957A",
  info: "#D4AF37",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="px-4 py-3 rounded-xl font-mono text-sm text-white shadow-lg pointer-events-auto"
              style={{ backgroundColor: colors[t.type] }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
