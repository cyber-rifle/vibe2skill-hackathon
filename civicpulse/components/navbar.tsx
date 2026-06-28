"use client";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "The Map", href: "/map" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "For Cities", href: "/for-cities" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [pathname, setPathname] = useState('');
  const isDarkPage = pathname === '/dashboard' || pathname === '/map';

  useEffect(() => {
    setPathname(window.location.pathname);
    const handler = () => {
      setScrolled(window.scrollY > 50);
      const hero = document.querySelector('section');
      const heroHeight = hero?.offsetHeight ?? 600;
      setOnDark(window.scrollY < heroHeight);
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler(); // initial check
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className={`transition-all duration-300 mx-auto flex h-16 max-w-6xl items-center justify-between px-5
  ${(isDarkPage || (!scrolled && onDark))
    ? isDarkPage
      ? 'bg-white/10 backdrop-blur-xl border-b border-white/10'
      : 'bg-transparent border-transparent'
    : 'bg-white/80 backdrop-blur-xl border-b border-[#E8E4DB]/60 shadow-sm'
  }`}>
        <a href="/" className="iridescent-text font-display text-2xl font-medium tracking-tight">
          CivicPulse
        </a>

        {/* Desktop nav — unchanged items but dynamic text color */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`font-sans text-sm transition-colors ${
                  (onDark || isDarkPage) ? 'text-white/70 hover:text-white' : 'text-[#7A6A58] hover:text-[#1A1208]'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#upload"
            className="shimmer-btn rounded-full px-5 py-2 font-sans text-sm font-medium shadow-sm"
          >
            Report an Issue
          </a>

          {/* Hamburger — mobile only */}
          <button
            className="flex flex-col gap-1.5 md:hidden p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 transition-all duration-200 ${(onDark || isDarkPage) ? 'bg-white/80' : 'bg-[#1A1208]'} ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${(onDark || isDarkPage) ? 'bg-white/80' : 'bg-[#1A1208]'} ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 transition-all duration-200 ${(onDark || isDarkPage) ? 'bg-white/80' : 'bg-[#1A1208]'} ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-[#E8E4DB] px-5 py-4 space-y-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block font-sans text-sm text-[#7A6A58] hover:text-[#1A1208] transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
