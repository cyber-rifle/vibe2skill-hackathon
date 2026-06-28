"use client"
import { MapIcon } from "lucide-react"
import { motion } from "framer-motion"
import StatCounter from "@/components/StatCounter"
import { useEffect, useRef } from "react";

const words1 = ["Report", "it."]
const words2 = ["Watch", "it", "act."]

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x:number; y:number; vx:number; vy:number; color:string }[] = [];
    const COLORS = ['rgba(91,191,191,0.5)', 'rgba(212,175,106,0.4)', 'rgba(91,191,191,0.3)'];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < 85; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          color: COLORS[i % COLORS.length],
        });
      }
    };

    let mouseX = -999, mouseY = -999;
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mouseX, dy = p.y - mouseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          p.vx += (dx / dist) * 0.08;
          p.vy += (dy / dist) * 0.08;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = Math.sqrt(ddx*ddx + ddy*ddy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(91,191,191,${(1 - d/120) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);
    resize();
    init();
    draw();
    canvas.addEventListener('mousemove', onMouse);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <section className="relative overflow-hidden hero-grain"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0A1628 70%, #0D1F3C 85%, #FAF7F2 100%)' }}>
      
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />
      {/* Top right — teal */}
      <div aria-hidden="true" className="ambient-orb absolute -right-60 -top-60 h-[50rem] w-[50rem] opacity-[0.18]" />
      {/* Bottom left — coral/gold */}
      <div aria-hidden="true" className="ambient-orb absolute -left-40 bottom-20 h-[36rem] w-[36rem] opacity-[0.10]"
        style={{ background: 'linear-gradient(135deg,#E8957A,#D4AF6A)' }} />
      {/* Center subtle — teal mid */}
      <div aria-hidden="true" className="ambient-orb absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[20rem] w-[20rem] opacity-[0.04]"
        style={{ background: '#5BBFBF' }} />

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-24 md:pb-32 md:pt-32">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 300 }}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10
            bg-white/5 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5BBFBF] glow-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#5BBFBF]">
              Powered by Google AI Studio
            </span>
            <span className="h-px w-4 bg-white/20" />
            <span className="font-mono text-xs text-white/40">Hyderabad</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-[80px] lg:text-[96px] font-light leading-[0.95] tracking-tight text-white text-balance">
            {words1.map((word, i) => (
              <span key={`w1-${i}`} className="inline-block blur-reveal mr-[0.25em]"
                style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                {word}
              </span>
            ))}{" "}
            <span className="italic">
              {words2.map((word, i) => (
                <span key={`w2-${i}`} className="inline-block gradient-text blur-reveal mr-[0.2em]"
                  style={{ animationDelay: `${0.44 + i * 0.08}s` }}>
                  {word}
                </span>
              ))}
            </span>
          </h1>

          <motion.p 
            initial={{ opacity:0, y:16 }} 
            animate={{ opacity:1, y:0 }} 
            transition={{ delay:0.75, duration:0.6 }}
            className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-white/60">
            Every day, broken streetlights, overflowing drains, and crumbling roads go
            unresolved because reports vanish into the wrong inbox. CivicPulse turns a
            single photo into a routed, actionable case — in under 30 seconds.
          </motion.p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#upload" className="shimmer-btn magnetic-btn rounded-full px-8 py-3.5 font-sans text-sm font-semibold shadow-lg">
              Report an Issue
            </a>
            <a href="/map" className="magnetic-btn inline-flex items-center gap-2 rounded-full border border-white/20
              bg-white/5 px-8 py-3.5 font-sans text-sm font-medium text-white backdrop-blur-sm
              transition-all hover:bg-white/10 hover:border-white/30">
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              View the Map
            </a>
          </div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 flex flex-wrap gap-12"
        >
          <div className="iridescent-border-animated rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={1240} suffix="+" label="Issues Reported"
                duration={1600} liveReportCount={true} darkMode={true} />
            </div>
          </div>
          <div className="iridescent-border-animated rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={89} suffix="%" label="Resolved in 7 Days"
                duration={1800} darkMode={true} />
            </div>
          </div>
          <div className="iridescent-border-animated rounded-2xl">
            <div className="rounded-2xl px-6 py-4" style={{ background: "rgba(10,22,40,0.8)" }}>
              <StatCounter value={14} suffix="+" label="Departments Linked"
                duration={1400} darkMode={true} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient bridge to ivory */}
      <div aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #FAF7F2)' }} />
    </section>
  )
}
