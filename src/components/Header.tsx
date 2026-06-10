import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg wohin-gradient flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="2.5" fill="white" />
                <path d="M9 3 L9 6.5 M9 11.5 L9 15 M3 9 L6.5 9 M11.5 9 L15 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--color-medizin-navy)] text-lg tracking-tight">
              WohinMedizin<span className="text-[var(--color-donau-blau)]">.at</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/beschwerden" className="text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors">Beschwerden</Link>
            <Link href="/erkrankungen" className="text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors">Erkrankungen</Link>
            <Link href="/fachrichtungen" className="text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors">Fachrichtungen</Link>
            <Link href="/selten" className="text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors">Seltene Erkrankungen</Link>
            <Link href="/fuer-aerzte" className="text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors">Für Ärzt:innen</Link>
          </nav>

          <Link
            href="/navigator"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg wohin-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Orientierung starten
          </Link>
        </div>
      </div>
    </header>
  );
}
