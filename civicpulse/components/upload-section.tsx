"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReasoningReveal } from "@/components/ReasoningReveal";
import { useReports, severityLabel } from "@/lib/report-context";
import { Textarea } from "@/components/ui/textarea";
import BoundingBoxOverlay from "@/components/BoundingBoxOverlay";
import { SeverityBadge } from "@/components/severity-badge";
import { useToast } from "@/components/toast";

const NEIGHBORHOODS: Record<string, { lat: number; lon: number }> = {
  "Banjara Hills":  { lat: 17.4156, lon: 78.4480 },
  "Jubilee Hills":  { lat: 17.4325, lon: 78.4071 },
  "Hitech City":    { lat: 17.4435, lon: 78.3772 },
  "Madhapur":       { lat: 17.4418, lon: 78.3912 },
  "Gachibowli":     { lat: 17.4401, lon: 78.3489 },
  "Kondapur":       { lat: 17.4600, lon: 78.3615 },
  "Kukatpally":     { lat: 17.4849, lon: 78.3985 },
  "Secunderabad":   { lat: 17.4399, lon: 78.4983 },
  "Ameerpet":       { lat: 17.4374, lon: 78.4487 },
  "Begumpet":       { lat: 17.4432, lon: 78.4681 },
  "LB Nagar":       { lat: 17.3483, lon: 78.5468 },
  "Dilsukhnagar":   { lat: 17.3684, lon: 78.5247 },
  "Uppal":          { lat: 17.4051, lon: 78.5595 },
  "Kompally":       { lat: 17.5406, lon: 78.4869 },
  "Shamirpet":      { lat: 17.5355, lon: 78.5644 },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, or WEBP image"
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Image must be under 10MB — try compressing it first"
  }
  return null
}

const DEFAULT_LAT = 17.385
const DEFAULT_LON = 78.487

interface Step { step: string; result: any; }

const PLACEHOLDER_STEPS = [
  { label: "Classifying issue...",           hint: "Identifying the category from the photo." },
  { label: "Checking nearby reports...",     hint: "Looking for duplicates within the area." },
  { label: "Assessing severity...",          hint: "Estimating urgency and public impact." },
  { label: "Drafting report and routing...", hint: "Preparing the case for the right department." },
];

const ESCALATION_MAP: Record<string, { body: string; escalation: string }> = {
  "GHMC Roads Department":      { body: "GHMC",         escalation: "GHMC Commissioner" },
  "GHMC Electrical Department": { body: "GHMC",         escalation: "GHMC Commissioner" },
  "Electrical/Streetlighting":  { body: "GHMC",         escalation: "GHMC Commissioner" },
  "HMWSSB":                     { body: "HMWSSB Board", escalation: "MD HMWSSB" },
  "GHMC Sanitation":            { body: "GHMC",         escalation: "Zonal Commissioner" },
};
const DEFAULT_ESCALATION = { body: "Municipal Corporation", escalation: "Commissioner" };

export function UploadSection() {
  const router = useRouter();
  const { addConfirmedReport } = useReports();
  const { addToast } = useToast();

  const [selectedFile, setSelectedFile]   = useState<File | null>(null);
  const [preview, setPreview]             = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Step[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editedReportText, setEditedReportText] = useState<string>("");
  const [showConfirmPanel, setShowConfirmPanel] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const [locationInput, setLocationInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeLat, setActiveLat] = useState(DEFAULT_LAT)
  const [activeLon, setActiveLon] = useState(DEFAULT_LON)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  // Feature 1 — GPS
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationName, setLocationName] = useState("")

  // Feature 12 — Voice Input
  const [isListening, setIsListening] = useState(false)
  const [voiceNote, setVoiceNote] = useState("")

  // Feature 15 — Share card state
  const [confirmedReport, setConfirmedReport] = useState<{
    category: string; location: string; severity: string; department: string;
  } | null>(null)

  const inputRef   = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timeoutIds.current.forEach(clearTimeout); };
  }, []);

  function clearPendingTimeouts() {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateFile(file)
    if (validationError) {
      addToast(validationError, "error")
      return
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysisSteps([]);
    setAnalysisError(null);
    clearPendingTimeouts();
  }

  // Feature 1 — GPS Handler
  const handleGetLocation = () => {
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setActiveLat(latitude)
        setActiveLon(longitude)
        setLocationConfirmed(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          setLocationName(data.display_name?.split(",").slice(0, 3).join(", ") ?? "Location detected")
        } catch {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
        setIsGettingLocation(false)
      },
      (err: GeolocationPositionError) => {
        setIsGettingLocation(false)
        const messages: Record<number, string> = {
          1: "Location access denied — select manually",
          2: "Location unavailable right now — select manually",
          3: "Location request timed out — select manually",
        }
        setLocationName(messages[err.code] ?? "Could not detect location — select manually")
      }
    )
  }

  // Feature 12 — Voice Input Handler
  const handleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      addToast("Voice input not supported in this browser", "error")
      return
    }
    const recognition = new SR()
    recognition.lang = "en-IN"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (e: any) => {
      setVoiceNote(e.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => {
      setIsListening(false)
      addToast("Voice input failed — try again", "error")
    }
    recognition.start()
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    clearPendingTimeouts();
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSteps([]);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    try {
      const imageBase64 = await toBase64(selectedFile);

      if (!imageBase64 || imageBase64.length < 100) {
        setAnalysisError("Image conversion failed — please try again");
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: selectedFile.type,
          lat: activeLat,
          lon: activeLon,
          existingReports: [],
          voiceNote: voiceNote || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text()
        addToast("Analysis failed — retrying", "error")
        throw new Error(errorText || `Analyze request failed with status ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Analyze response did not include a readable body')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      setAnalysisSteps([])

          const STEP_ORDER = ['classify', 'duplicate_check', 'severity_assessment', 'final_report']

          function upsertStep(stepName: string, result: unknown) {
            setAnalysisSteps((prev) => {
              const copy = [...prev]
              const idx = copy.findIndex((s: any) => s.step === stepName)
              const entry = { step: stepName, result }
              if (idx !== -1) {
                copy[idx] = entry
                return copy
              }
              const canonicalIndex = Math.max(0, Math.min(STEP_ORDER.length, STEP_ORDER.indexOf(stepName)))
              if (canonicalIndex >= 0 && canonicalIndex < STEP_ORDER.length) {
                let insertAt = copy.findIndex((s: any) => STEP_ORDER.indexOf(s.step) > canonicalIndex)
                if (insertAt === -1) insertAt = copy.length
                copy.splice(insertAt, 0, entry)
                return copy
              }
              copy.push(entry)
              return copy
            })
          }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let eventEndIndex = buffer.indexOf('\n\n')
        while (eventEndIndex !== -1) {
          const eventChunk = buffer.slice(0, eventEndIndex).trim()
          buffer = buffer.slice(eventEndIndex + 2)

          if (eventChunk) {
            const lines = eventChunk.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6).trim()
              if (!payload || payload === '[DONE]') continue
              try {
                const event = JSON.parse(payload)
                if (event?.step && event?.result !== undefined) {
                  if (event.step === 'severity_retry') {
                    upsertStep('severity_assessment', { __retryMessage: event.result?.message })
                    continue
                  }
                  if (event.step === 'report_retry') {
                    upsertStep('final_report', { __retryMessage: event.result?.message })
                    continue
                  }
                  if (event.step === 'severity_streaming') {
                    setStreamingText(event.result?.full_text ?? "")
                    continue
                  }
                  upsertStep(event.step, event.result)
                  if (event.step === 'severity_assessment') {
                    setStreamingText("")
                  }

                  if (event.step === 'final_report') {
                    const finalReportText = event.result?.report?.reportText ?? event.result?.report?.text
                    if (typeof finalReportText === 'string') {
                      setEditedReportText(finalReportText)
                      setShowConfirmPanel(true)
                    }
                    // Feature 2 — Toast on analysis complete
                    addToast("Analysis complete", "success")
                  }
                }
              } catch {
                // Ignore malformed interim payloads
              }
            }
          }

          eventEndIndex = buffer.indexOf('\n\n')
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const lines = buffer.trim().split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            const event = JSON.parse(payload)
            if (event?.step && event?.result !== undefined) {
              setAnalysisSteps((prev) => [...prev, event])
            }
          } catch {
            // ignore
          }
        }
      }

      setIsAnalyzing(false)
    } catch (err) {
      const message = !navigator.onLine
        ? "You're offline — reconnect and try again"
        : String(err)
      setAnalysisError(message)
      addToast("Analysis failed", "error")
      setIsAnalyzing(false)
    }
  }

  const handleConfirmReport = () => {
    const step1Result = analysisSteps.find((s) => s.step === 'classify')?.result
    const step3Result = analysisSteps.find((s) => s.step === 'severity_assessment')?.result
    const step4ResultForUrgency = analysisSteps.find((s) => s.step === 'final_report')?.result
    const step4Result = analysisSteps.find((s) => s.step === 'final_report')?.result

    const category = step1Result?.category ?? 'other'
    const dept = step4Result?.report?.department ?? 'Municipal Corporation'
    const sevNum = step3Result?.urgencyScore ??
      step4ResultForUrgency?.urgencyScore ??
      parseInt(step3Result?.assessment?.match(/(\d)\/5/)?.[1] ?? "3", 10)
    const sevLabel = severityLabel(sevNum)

    const newReport = {
      id: crypto.randomUUID(),
      lat: activeLat,
      lon: activeLon,
      category: category,
      description: editedReportText,
      severity: sevLabel,
      report: editedReportText,
      timeAgo: 'Just now',
      status: 'reported' as const,
      department: dept,
      resolutionTimeEstimate: step3Result?.resolutionTimeEstimate ?? undefined,
      createdAt: new Date().toISOString(),
    }

    // Feature 15 — Store confirmed report details for share card
    setConfirmedReport({
      category,
      location: locationName || locationInput || "Hyderabad",
      severity: String(sevNum),
      department: dept,
    })

    addConfirmedReport(newReport)
    // Feature 2 — Toast on confirm
    addToast("Report added to map", "success")
    setTimeout(() => router.push('/map'), 1800)
  }

  const handleDiscard = () => {
    setShowConfirmPanel(false)
    setEditedReportText("")
    setAnalysisSteps([])
    setSelectedFile(null)
    setPreview(null)
    setImgDims(null)
    setAnalysisError(null)
    setLocationInput("")
    setLocationName("")
    setActiveLat(DEFAULT_LAT)
    setActiveLon(DEFAULT_LON)
    setLocationConfirmed(false)
    setShowSuggestions(false)
    setVoiceNote("")
    setConfirmedReport(null)
    // Feature 2 — Toast on discard
    addToast("Report discarded", "info")
  }

  const step3Result = analysisSteps.find((s) => s.step === 'severity_assessment')?.result

  // Feature 9 — Confidence check
  const classifyResult = analysisSteps.find((s) => s.step === 'classify')?.result
  const confidence = classifyResult?.confidence ?? 1

  return (
    <section id="upload" className="mx-auto max-w-3xl px-5 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        {/* Feature 10 — card-hover on upload card */}
        <div className="iridescent-border rounded-2xl p-[2px] card-hover">
          <div className="rounded-2xl bg-white p-6 md:p-8">
            <h2 className="mt-3 font-display text-3xl font-light text-ink">Show us what needs fixing</h2>

            <label
              htmlFor="file-upload"
              onClick={() => inputRef.current?.click()}
              className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal/50 bg-ivory-deep/40 px-6 py-12 text-center transition-colors hover:border-teal cursor-pointer"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                const validationError = validateFile(file)
                if (validationError) {
                  addToast(validationError, "error")
                  return
                }
                setSelectedFile(file);
                setPreview(URL.createObjectURL(file));
                setAnalysisSteps([]);
                setAnalysisError(null);
                clearPendingTimeouts();
              }}
            >
            {preview ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={preview}
                  alt="Selected"
                  className="max-h-48 rounded-lg object-contain"
                  onLoad={() => {
                    if (imgRef.current) {
                      setImgDims({
                        w: imgRef.current.clientWidth,
                        h: imgRef.current.clientHeight,
                      });
                    }
                  }}
                />
                {(() => {
                  type ClassifyResult = { boundingBox?: { ymin: number; xmin: number; ymax: number; xmax: number }; severity?: number; category?: string };
                  const cr = analysisSteps.find((s) => s.step === "classify")?.result as ClassifyResult;
                  const bbox = cr?.boundingBox;
                  if (!imgDims || !bbox) return null;
                  return (
                    <BoundingBoxOverlay
                      box={bbox}
                      imageWidth={imgDims.w}
                      imageHeight={imgDims.h}
                      severity={cr?.severity ?? 3}
                      category={cr?.category ?? "issue"}
                    />
                  );
                })()}
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <UploadCloud className="h-6 w-6 text-teal" aria-hidden="true" />
                </div>
                <p className="mt-4 font-sans text-sm font-medium text-ink">Drag and drop a photo, or click to browse</p>
                <p className="mt-1 font-sans text-xs text-ink-muted">JPG or PNG, up to 10MB</p>
              </>
            )}
            </label>
            <input
              id="file-upload"
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              tabIndex={-1}
              onChange={handleFileChange}
            />

            {/* Feature 9 — Low confidence warning */}
            <AnimatePresence>
              {analysisSteps.some((s) => s.step === 'classify') && confidence < 0.70 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg px-3 py-2 mt-2"
                >
                  ⚠ Low confidence ({Math.round(confidence * 100)}%) — try a closer photo with better lighting for more accurate results
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feature 12 — Voice input */}
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`flex items-center gap-2 text-xs font-mono border rounded-full px-4 py-2 w-full justify-center transition-colors ${
                  isListening
                    ? "border-[#E8957A] text-[#E8957A] bg-[#E8957A]/10 animate-pulse"
                    : "border-teal/40 text-teal hover:bg-teal/10"
                }`}
              >
                🎙 {isListening ? "Listening..." : "Describe the issue by voice"}
              </button>
              {voiceNote && (
                <p className="text-xs font-mono text-[#7A6A58] bg-[#FAF7F2] rounded-lg px-3 py-2 border border-[#E8E4DB]">
                  &ldquo;{voiceNote}&rdquo;
                </p>
              )}
            </div>

            {/* Feature 1 — GPS Location Input */}
            <div className="mt-5">
              <label htmlFor="location" className="font-mono text-xs uppercase tracking-[0.15em] text-ink-muted">Location</label>
              <div className="space-y-3 mt-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 text-sm font-mono text-teal border border-teal/40 rounded-full px-4 py-2 hover:bg-teal/10 transition-colors w-full justify-center disabled:opacity-60"
                >
                  {isGettingLocation ? "Detecting location..." : "📍 Use My Location"}
                </button>
                {locationName && (
                  <p className="text-xs text-[#7A6A58] font-mono text-center">{locationName}</p>
                )}
                <p className="text-xs text-[#7A6A58] text-center">or select manually</p>
                {/* Existing dropdown — manual fallback */}
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value)
                      setShowSuggestions(true)
                      setLocationConfirmed(false)
                      setActiveLat(DEFAULT_LAT)
                      setActiveLon(DEFAULT_LON)
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => locationInput.length >= 2 && setShowSuggestions(true)}
                    placeholder="Enter area in Hyderabad..."
                    className="w-full rounded-lg border border-[#E6DDCF] bg-white px-4 py-2 font-mono text-sm text-[#1A1208] placeholder-[#5A6A58] focus:border-[#5BBFBF] focus:outline-none focus:ring-1 focus:ring-[#5BBFBF]"
                  />
                  {locationConfirmed && !locationName && (
                    <p className="mt-1 font-mono text-xs text-[#5BBFBF]">
                      📍 {locationInput}
                    </p>
                  )}
                  {showSuggestions && locationInput.length >= 2 && (
                    <ul className="absolute z-50 mt-1 w-full rounded-lg border border-[#E6DDCF] bg-white shadow-md max-h-48 overflow-y-auto">
                      {Object.keys(NEIGHBORHOODS)
                        .filter((name) =>
                          name.toLowerCase().includes(locationInput.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((name) => (
                          <li
                            key={name}
                            onMouseDown={() => {
                              setLocationInput(name)
                              setActiveLat(NEIGHBORHOODS[name].lat)
                              setActiveLon(NEIGHBORHOODS[name].lon)
                              setLocationConfirmed(true)
                              setShowSuggestions(false)
                            }}
                            className="cursor-pointer px-4 py-2 font-mono text-sm text-[#1A1208] hover:bg-[#F0EBE3]"
                          >
                            {name}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              suppressHydrationWarning
              className="shimmer-btn mt-6 w-full rounded-full px-6 py-3 font-sans text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "Analyzing…" : "Analyze Issue"}
            </button>

            {analysisError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="font-sans text-sm text-red-700">{analysisError}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mt-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Agent Analysis</p>
        {analysisSteps.length > 0 ? (
          <>
            <ReasoningReveal steps={analysisSteps} streamingText={streamingText} />
            {showConfirmPanel && (
              <div className="mt-8 border border-[#5BBFBF] rounded-xl p-6 bg-[#FAF7F2]">

                <p className="font-mono text-xs uppercase tracking-widest text-[#5BBFBF] mb-4">
                  Human-in-the-loop review — confirm before submitting
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm font-mono text-[#7A6A58]">
                  <span>Category: <strong className="text-[#1A1208]">{analysisSteps.find((s) => s.step === 'classify')?.result?.category}</strong></span>
                  <span className="flex items-center gap-2">
                    Severity:
                    <SeverityBadge severity={severityLabel(
                      step3Result?.urgencyScore ??
                      parseInt(step3Result?.assessment?.match(/(\d)\/5/)?.[1] ?? "3", 10)
                    )} />
                  </span>
                  <span>Department: <strong className="text-[#1A1208]">{analysisSteps.find((s) => s.step === 'final_report')?.result?.report?.department}</strong></span>
                </div>

                {/* Feature 3 — Department Escalation Pills */}
                {(() => {
                  const escalationUrgency = parseInt(step3Result?.assessment?.match(/(\d)\/5/)?.[1] ?? "3", 10);
                  const escalationDepartment = analysisSteps.find((s) => s.step === 'final_report')?.result?.report?.department ?? "Municipal Corporation";
                  const escalationEntry = ESCALATION_MAP[escalationDepartment] ?? DEFAULT_ESCALATION;
                  const escalationColor = escalationUrgency >= 4 ? "#E8957A" : "#5BBFBF";
                  const pills = ["Report", escalationDepartment, escalationEntry.body, ...(escalationUrgency >= 4 ? [escalationEntry.escalation] : [])];
                  return (
                    <div className="flex items-center gap-1 flex-wrap mt-2 text-xs font-mono mb-4">
                      {pills.map((pill, i) => (
                        <span key={`${pill}-${i}`} className="flex items-center gap-1">
                          <span style={{ color: escalationColor }} className="border rounded-full px-2 py-0.5 border-current">
                            {pill}
                          </span>
                          {i < pills.length - 1 && <span className="text-[#7A6A58]">→</span>}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {step3Result?.resolutionTimeEstimate ? (
                  <p className="text-sm text-foreground/80 mt-1">
                    <span className="font-medium">Expected resolution:</span> {step3Result.resolutionTimeEstimate}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Timeline varies by department
                  </p>
                )}

                <Textarea
                  value={editedReportText}
                  onChange={(e) => setEditedReportText(e.target.value)}
                  className="w-full min-h-[120px] mb-4 mt-4 font-mono text-sm bg-white border-[#C9A84C] focus:ring-[#5BBFBF]"
                  placeholder="Edit the AI-drafted report before submitting..."
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmReport}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#5BBFBF] to-[#C9A84C] hover:opacity-90 transition-opacity"
                  >
                    Confirm and Add to Map
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="py-2 px-4 rounded-lg text-sm font-medium text-[#7A6A58] border border-[#7A6A58] hover:bg-[#F0EBE3] transition-colors"
                  >
                    Discard
                  </button>
                </div>

                {/* Feature 15 — Shareable Report Card */}
                {confirmedReport && (
                  <div className="mt-4 rounded-xl border border-[#E8E4DB] bg-[#FAF7F2] p-4 space-y-2">
                    <p className="text-xs font-mono text-[#7A6A58] uppercase tracking-wider">
                      Share this report
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1208] truncate">
                          {confirmedReport.category} — {confirmedReport.location}
                        </p>
                        <p className="text-xs text-[#7A6A58]">
                          Severity: {confirmedReport.severity}/5 · {confirmedReport.department}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `I reported a civic issue via CivicPulse: ${confirmedReport.category} at ${confirmedReport.location}. Severity: ${confirmedReport.severity}/5. Routed to ${confirmedReport.department}. #CivicPulse #FixHyderabad`
                          )
                          addToast("Copied to clipboard!", "success")
                        }}
                        className="text-xs font-mono border border-teal/40 text-teal rounded-full px-3 py-1 hover:bg-teal/10 shrink-0 transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <ol className="mt-5 flex flex-col gap-3">
            {PLACEHOLDER_STEPS.map((step, index) => (
              <li key={step.label} className="flex items-start gap-4 rounded-xl border border-border border-l-4 border-l-teal bg-ivory-deep px-5 py-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-ink-muted">{index + 1}</span>
                <div>
                  <p className="font-mono text-sm text-teal">{step.label}</p>
                  <p className="mt-1 font-sans text-xs text-ink-muted">{step.hint}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
