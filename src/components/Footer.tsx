import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--color-medizin-navy)] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg wohin-gradient flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="2.5" fill="white" />
                  <path d="M9 3 L9 6.5 M9 11.5 L9 15 M3 9 L6.5 9 M11.5 9 L15 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-white">
                WohinMedizin<span className="text-[var(--color-alpen-mint)]">.at</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Wissen, wohin<br />bei Gesundheitsfragen.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">Themen</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/beschwerden" className="hover:text-white transition-colors">Beschwerden</Link></li>
              <li><Link href="/erkrankungen" className="hover:text-white transition-colors">Erkrankungen</Link></li>
              <li><Link href="/fachrichtungen" className="hover:text-white transition-colors">Fachrichtungen</Link></li>
              <li><Link href="/selten" className="hover:text-white transition-colors">Seltene Erkrankungen</Link></li>
              <li><Link href="/gesundheitssystem" className="hover:text-white transition-colors">Gesundheitssystem AT</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">Plattform</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/navigator" className="hover:text-white transition-colors">WohinMedizin Navigator</Link></li>
              <li><Link href="/fuer-aerzte" className="hover:text-white transition-colors">Für Ärzt:innen</Link></li>
              <li><Link href="/fuer-partner" className="hover:text-white transition-colors">Für Partner</Link></li>
              <li><Link href="/ueber-uns" className="hover:text-white transition-colors">Über WohinMedizin.at</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link href="/nutzungsbedingungen" className="hover:text-white transition-colors">Nutzungsbedingungen</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2026 WohinMedizin.at. Keine Diagnose. Keine ärztliche Beratung.
          </p>
          <p className="text-xs text-white/40">
            Geprüfte Inhalte. Österreichischer Gesundheitskontext.
          </p>
        </div>
      </div>
    </footer>
  );
}
