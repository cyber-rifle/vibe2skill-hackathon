const NAV_LINKS = [
  { label: "How it works", href: "#upload" },
  { label: "The Map", href: "/map" },
  { label: "For Cities", href: "#" },
  { label: "About", href: "#" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="backdrop-blur-md bg-background/80 border-b border-border/50 mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/" className="iridescent-text font-display text-2xl font-medium tracking-tight">
          CivicPulse
        </a>

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

        <a
          href="#upload"
          className="shimmer-btn rounded-full px-5 py-2 font-sans text-sm font-medium shadow-sm"
        >
          Report an Issue
        </a>
      </nav>
    </header>
  )
}
