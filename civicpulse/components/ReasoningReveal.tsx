"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const STEP_LABELS: Record<string, string> = {
  classify: "Classifying issue...",
  duplicate_check: "Checking nearby reports...",
  severity_assessment: "Assessing severity...",
  final_report: "Drafting report and routing...",
};

const getSeverityColor = (severity: number) => {
  if (severity >= 4) return "#E8957A";
  if (severity >= 2) return "#D4AF37";
  return "#5BBFBF";
};

const ClassifyCard = (result: unknown) => {
  const category = (result as any)?.category ?? "Unknown";
  const description = (result as any)?.description ?? "";
  const confidence = (result as any)?.confidence ?? 0;
  const severity = (result as any)?.severity ?? 0;
  const severityColor = getSeverityColor(severity);

  return (
    <div className="space-y-2 mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-[#1A1208]/10 text-[#1A1208] text-xs font-semibold px-3 py-1 rounded-full font-mono">
          {category}
        </span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${severityColor}33`, color: severityColor }}
        >
          Severity {severity}/5
        </span>
      </div>
      <p className="text-sm text-[#1A1208]/80 leading-relaxed">{description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[#7A6A58] mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#E6DDCF] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#5BBFBF]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.round(confidence * 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

const DuplicateCard = (result: unknown) => {
  const duplicatesFound = (result as any)?.duplicatesFound ?? 0;
  const nearbyReports = (result as any)?.nearbyReports ?? [];

  return (
    <div className="mt-2">
      {duplicatesFound > 0 ? (
        <p className="text-sm font-medium" style={{ color: "#D4AF37" }}>
          ⚠ {duplicatesFound} similar report(s) found within 100m
        </p>
      ) : (
        <p className="text-sm font-medium" style={{ color: "#22c55e" }}>
          ✓ No duplicates — this is a new report
        </p>
      )}
      {nearbyReports.length > 0 && duplicatesFound === 0 ? (
        <p className="text-xs text-[#7A6A58] mt-1">
          {nearbyReports.length} nearby report(s) of different issues within 100m
        </p>
      ) : null}
    </div>
  );
};

const SeverityCard = ({ result, streamingText }: { result: unknown; streamingText?: string }) => {
  const assessment = (result as any)?.assessment ?? "";
  const grounded = (result as any)?.grounded ?? false;
  const sources = (result as any)?.sources ?? [];
  const policyContext = (result as any)?.policyContext ?? null;
  const urgencyMatch = assessment.match(/(\d)\/5/);
  const urgency = urgencyMatch ? parseInt(urgencyMatch[1], 10) : 3;
  const resolutionTimeEstimate = (result as any)?.resolutionTimeEstimate ?? null;
  const severityColor = getSeverityColor(urgency);
  const category = (result as any)?.category ?? "";

  // Feature 16 — Gemini Explain expandable
  const [expanded, setExpanded] = useState(false);

  const getSourceLabel = (source: any) => {
    if (!source?.uri) return source?.title ?? "Unknown";
    try {
      return new URL(source.uri).hostname;
    } catch {
      return source.title ?? source.uri;
    }
  };

  return (
    <div className="space-y-3 mt-2">
      {grounded ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE DATA · Grounded via Google Search
        </motion.div>
      ) : null}
      <div>
        <div className="flex justify-between text-xs text-[#7A6A58] mb-1">
          <span>Urgency</span>
          <span>{urgency}/5</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <motion.div
              key={level}
              className="flex-1 h-2 rounded-sm"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: level * 0.08 }}
              style={{
                backgroundColor: level <= urgency ? severityColor : "#E6DDCF",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>
      </div>
      {resolutionTimeEstimate ? (
        <p className="text-sm text-[#1A1208]/80">Expected resolution: {resolutionTimeEstimate}</p>
      ) : (
        <p className="text-xs text-[#7A6A58]/80 italic">Timeline varies by department</p>
      )}
      {streamingText ? (
        <p className="text-sm text-[#1A1208]/80 font-mono leading-relaxed">
          {streamingText}
          <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 animate-pulse" />
        </p>
      ) : (
        <p className="text-xs text-[#7A6A58] leading-relaxed mt-1">{assessment}</p>
      )}
      {grounded && Array.isArray(sources) && sources.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {sources.slice(0, 3).map((source: any, index: number) => (
            <a
              key={index}
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-[#E6DDCF] hover:bg-[#D4C9B8] text-[#7A6A58] px-2.5 py-1 rounded-full transition-colors truncate max-w-[180px]"
            >
              {getSourceLabel(source)}
            </a>
          ))}
        </div>
      ) : null}

      {/* Feature 16 — Expandable Gemini explain */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-mono text-[#7A6A58] hover:text-[#1A1208] flex items-center gap-1 mt-2 transition-colors"
      >
        {expanded ? "▲ Hide reasoning" : "▼ Why this severity?"}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl bg-[#FAF7F2] border border-[#E8E4DB] p-4 space-y-4">

              {/* Policy context block */}
              {policyContext && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] mb-1.5">
                    Department Policy
                  </p>
                  <p className="text-sm text-[#7A6A58] leading-relaxed font-sans italic">
                    "{policyContext}"
                  </p>
                </div>
              )}

              {/* Live clickable sources */}
              {grounded && Array.isArray(sources) && sources.length > 0 && (
                <div className={policyContext ? "border-t border-[#E8E4DB] pt-3" : ""}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5BBFBF] mb-2">
                    Live Sources ({sources.length})
                  </p>
                  <div className="space-y-2">
                    {sources.slice(0, 5).map((source: any, i: number) => {
                      let hostname = source.uri || "";
                      try { hostname = new URL(source.uri).hostname; } catch {}
                      const title = source.title && source.title !== source.uri
                        ? source.title
                        : hostname;
                      return (
                        <a
                          key={i}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 group"
                        >
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#5BBFBF] mt-1.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-sans text-[#1A1208]
                              group-hover:text-[#5BBFBF] transition-colors leading-relaxed truncate">
                              {title}
                            </p>
                            <p className="text-[10px] font-mono text-[#7A6A58] truncate">
                              {source.uri.length > 55
                                ? source.uri.slice(0, 52) + "..."
                                : source.uri}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compact factors grid */}
              <div className="border-t border-[#E8E4DB] pt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#7A6A58] mb-2">
                  Factors
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Issue type", value: category || "civic issue" },
                    { label: "Urgency", value: `${urgency}/5` },
                    { label: "Data source", value: grounded ? "Google Search (live)" : "Training data" },
                    { label: "Sources cited", value: String(sources?.length ?? 0) },
                  ].map((f) => (
                    <div key={f.label}
                      className="bg-white rounded-lg px-3 py-2 border border-[#E8E4DB]">
                      <p className="font-mono text-[9px] uppercase tracking-wide text-[#7A6A58]">
                        {f.label}
                      </p>
                      <p className="font-sans text-xs font-medium text-[#1A1208] mt-0.5">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportCard = (result: unknown) => {
  const department = (result as any)?.report?.department ?? (result as any)?.department ?? "Unknown Department";
  const reportText = (result as any)?.report?.reportText ?? (result as any)?.reportText ?? "";

  const escalation = (result as any)?.report?.escalationPath ?? (result as any)?.escalationPath ?? null;
  const severity = (result as any)?.report?.severity ?? (result as any)?.severity ?? 3;
  const chainColor = severity >= 4 ? '#E8957A' : '#5BBFBF';

  // Build escalation chain from department name
  const ESCALATION_MAP: Record<string, string[]> = {
    'Municipal Roads Department': ['Citizen Report', 'Roads Dept', 'Municipal Corporation', ...(severity >= 4 ? ['Commissioner'] : [])],
    'State Water Board': ['Citizen Report', 'Water Board', 'State Authority', ...(severity >= 4 ? ['MD Water Board'] : [])],
    'Electrical/Streetlighting': ['Citizen Report', 'Electrical Dept', 'Municipal Corporation', ...(severity >= 4 ? ['Commissioner'] : [])],
    'Municipal Sanitation': ['Citizen Report', 'Sanitation', 'Zonal Commissioner', ...(severity >= 4 ? ['Commissioner'] : [])],
  };
  const chain = ESCALATION_MAP[department] ?? ['Citizen Report', department, 'Municipal Corporation'];

  return (
    <div className="space-y-2 mt-2">
      <div className="inline-flex items-center gap-2 bg-[#1A1208]/10 px-3 py-1.5 rounded-full">
        <span className="inline-block h-2 w-2 rounded-full bg-[#5BBFBF]" />
        <span className="text-sm font-semibold text-[#1A1208]">{department}</span>
      </div>
      
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {chain.map((node, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
              style={{
                borderColor: i === chain.length - 1 ? chainColor : 'rgba(26,18,8,0.15)',
                color: i === chain.length - 1 ? chainColor : '#7A6A58',
                background: i === chain.length - 1 ? `${chainColor}15` : 'transparent',
                fontWeight: i === chain.length - 1 ? '700' : '400',
              }}
            >
              {node}
            </motion.span>
            {i < chain.length - 1 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.1 }}
                className="font-mono text-[10px]"
                style={{ color: chainColor }}
              >→</motion.span>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-[#1A1208]/70 leading-relaxed line-clamp-2 mt-2">{reportText}</p>
    </div>
  );
};

const renderStepResult = (step: string, result: unknown, streamingText?: string) => {
  switch (step) {
    case "classify":
      return ClassifyCard(result);
    case "duplicate_check":
      return DuplicateCard(result);
    case "severity_assessment":
      return <SeverityCard result={result} streamingText={streamingText} />;
    case "final_report":
      return ReportCard(result);
    default:
      return null;
  }
};

interface Step { step: string; result: unknown; }

export function ReasoningReveal({ steps, streamingText = "" }: { steps: Step[]; streamingText?: string }) {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-[#7A6A58]">Analysis progress</span>
          <span className="font-mono text-xs text-[#7A6A58]">{steps.length}/4</span>
        </div>
        <div className="w-full h-1.5 bg-[#E6DDCF] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#5BBFBF] to-[#3D9E9E]"
            initial={{ width: "0%" }}
            animate={{ width: `${(steps.length / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
      <AnimatePresence>
        <ol className="mt-5 flex flex-col gap-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.35, ease: 'easeOut' }}
              className="flex items-start gap-4 rounded-2xl border border-[#E8E4DB] bg-white px-5 py-5 shadow-sm-warm"
              whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(26,18,8,0.10)", transition: { type: "spring", stiffness: 400, damping: 30 } }}
              whileTap={{ scale: 0.99, transition: { type: "spring", stiffness: 400, damping: 30 } }}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5BBFBF]/10 font-mono text-xs font-semibold text-[#5BBFBF]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm uppercase text-[#5BBFBF]">{STEP_LABELS[s.step] ?? s.step}</p>
                {typeof s.result === 'object' && s.result && (s.result as any).__retryMessage ? (
                  <div className="mt-1">
                    <p className="text-xs text-[#7A6A58] italic" style={{ fontFamily: 'JetBrains Mono' }}>
                      {(s.result as any).__retryMessage}
                    </p>
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-[#1A1208]" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {renderStepResult(s.step, s.result, s.step === 'severity_assessment' ? streamingText : undefined)}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </AnimatePresence>
    </div>
  );
}
