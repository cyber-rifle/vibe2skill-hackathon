"use client";
import { useEffect, useState, useRef } from "react";
import { useInView, motion } from "framer-motion";
import { useReports } from "@/lib/report-context";

interface StatCounterProps {
  value?: number;
  suffix: string;
  label: string;
  duration?: number;
  /** If true, will read live reportCount from context instead of static value */
  liveReportCount?: boolean;
}

export default function StatCounter({
  value = 0,
  suffix,
  label,
  duration = 1800,
  liveReportCount = false,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayedValue, setDisplayedValue] = useState(0);
  const [flash, setFlash] = useState(false);

  // Feature 4 — Read live count from context
  const { reportCount } = useReports();
  const targetValue = liveReportCount ? reportCount : value;
  const prevCountRef = useRef(targetValue);

  // Flash animation when reportCount increments
  useEffect(() => {
    if (liveReportCount && targetValue !== prevCountRef.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      prevCountRef.current = targetValue;
      return () => clearTimeout(t);
    }
  }, [liveReportCount, targetValue]);

  useEffect(() => {
    if (!inView) return;
    let animationFrame: number;
    const start = performance.now();
    const from = liveReportCount ? targetValue - 1 : 0;

    const tick = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayedValue(Math.round(from + (targetValue - from) * easeOut));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        setDisplayedValue(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, targetValue, duration, liveReportCount]);

  // Update displayed value when live count changes after initial animation
  useEffect(() => {
    if (liveReportCount && inView) {
      setDisplayedValue(targetValue);
    }
  }, [liveReportCount, targetValue, inView]);

  return (
    <div ref={ref} className="flex flex-col items-start">
      <motion.div
        animate={flash ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="font-display text-4xl font-light tracking-tight text-[#1A1208]"
      >
        {displayedValue}
        {suffix}
      </motion.div>
      <div className="font-mono text-xs uppercase tracking-[0.15em] text-[#7A6A58] mt-1">
        {label}
      </div>
    </div>
  );
}
