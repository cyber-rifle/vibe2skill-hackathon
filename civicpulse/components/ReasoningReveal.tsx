"use client";
import { motion } from "framer-motion";

const STEP_LABELS: Record<string, string> = {
  classify: "Classifying issue...",
  duplicate_check: "Checking nearby reports...",
  severity_assessment: "Assessing severity...",
  final_report: "Drafting report and routing...",
};

interface Step { step: string; result: unknown; }

export function ReasoningReveal({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-5 flex flex-col gap-3">
      {steps.map((s, i) => (
        <motion.li
          key={s.step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
          className="flex items-start gap-4 rounded-xl border border-border border-l-4 border-l-teal bg-ivory-deep px-5 py-4"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-xs text-ink-muted">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-teal">{STEP_LABELS[s.step] ?? s.step}</p>
            <div className="mt-2 font-sans text-xs text-ink-muted">
              {typeof s.result === "string"
                ? <p>{s.result}</p>
                : <pre className="whitespace-pre-wrap break-words">{JSON.stringify(s.result, null, 2)}</pre>}
            </div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
