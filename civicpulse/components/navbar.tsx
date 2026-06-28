"use client";
import { useState } from "react";

const NAV_LINKS = [
  { label: "How it works", href: "#upload" },
  { label: "The Map", href: "/map" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "For Cities", href: "#" },
  { label: "About", href: "#" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="backdrop-blur-md bg-background/80 border-b border-border/50 mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="iridescent-text font-display text-2xl font-medium tracking-tight">
          CivicPulse
        </a>

        {/* Desktop nav — unchanged */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-sans text-sm text-[#7A6A58] transition-colors hover:text-[#1A1208]"
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
            <span className={`block h-0.5 w-5 bg-[#1A1208] transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#1A1208] transition-all duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#1A1208] transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/50 px-5 py-4 space-y-4">
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
