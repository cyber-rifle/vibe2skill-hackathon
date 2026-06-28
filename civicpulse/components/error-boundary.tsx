"use client"
import React from "react"

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <h1 className="font-display text-2xl text-[#1A1208] mb-2">Something went wrong</h1>
          <p className="text-sm text-[#7A6A58] mb-6 max-w-md">
            CivicPulse hit an unexpected error. Refreshing usually fixes it — 
            your reports are saved locally.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = "/" }}
            className="shimmer-btn rounded-full px-6 py-3 text-sm font-medium"
          >
            Reload CivicPulse
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
