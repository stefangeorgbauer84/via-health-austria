import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const quickTopics = [
  "Bauchschmerzen",
  "Hautausschlag",
  "Kopfschmerzen",
  "Gelenkschmerzen",
  "Kind krank",
  "Seltene Erkrankungen",
  "Kassenarzt oder Wahlarzt?",
  "Psychische Belastung",
];

const specialties = [
  { name: "Allgemeinmedizin", href: "/fachrichtungen/allgemeinmedizin" },
  { name: "Dermatologie", href: "/fachrichtungen/dermatologie" },
  { name: "Orthopädie", href: "/fachrichtungen/orthopaedie" },
  { name: "Rheumatologie", href: "/fachrichtungen/rheumatologie" },
  { name: "Neurologie", href: "/fachrichtungen/neurologie" },
  { name: "Innere Medizin", href: "/fachrichtungen/innere-medizin" },
  { name: "Psychiatrie", href: "/fachrichtungen/psychiatrie" },
  { name: "Kinder- und Jugendheilkunde", href: "/fachrichtungen/kinderheilkunde" },
];

const faqs = [
  "Wann zur Dermatologie?",
  "Wann zur Rheumatologie?",
  "Wann reicht die Hausärztin?",
  "Kassenarzt vs. Wahlarzt — was ist der Unterschied?",
  "Wie funktioniert eine Überweisung?",
  "Wann rasch medizinische Hilfe holen?",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[var(--color-morgen-hellblau)]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 wohin-gradient blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 bg-[var(--color-selten-violett)] blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-muted)] mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--color-alpen-mint)]" />
                Medizinische Orientierung für Österreich
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-medizin-navy)] leading-tight mb-6">
                Wissen, wohin bei{" "}
                <span className="wohin-gradient-text">Gesundheitsfragen.</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-8 max-w-2xl">
                WohinMedizin.at hilft dir, Beschwerden besser zu verstehen, passende Fachrichtungen zu erkennen und geeignete medizinische Anlaufstellen in Österreich zu finden. Verständlich, datenschutzfreundlich und ohne Diagnoseversprechen.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/navigator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl wohin-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  Orientierung starten
                </Link>
                <Link
                  href="/themen"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-medizin-navy)] font-semibold hover:bg-[var(--color-morgen-hellblau)] transition-colors"
                >
                  Gesundheitsthemen entdecken
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
                {["Keine Diagnose", "Keine Pflichtregistrierung", "Geprüfte Inhalte", "Österreichischer Gesundheitskontext"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-alpen-mint)]">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Topics */}
        <section className="bg-white border-b border-[var(--color-border)] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-3">Schnell nachschlagen</p>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <Link
                  key={topic}
                  href={`/navigator?q=${encodeURIComponent(topic)}`}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-morgen-hellblau)] text-[var(--color-medizin-navy)] text-sm hover:bg-[var(--color-donau-blau)] hover:text-white transition-colors border border-[var(--color-border)]"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties */}
        <section className="py-16 bg-[var(--color-warmweiss)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[var(--color-medizin-navy)] mb-2">Fachrichtungen einfach erklärt</h2>
            <p className="text-[var(--color-muted)] mb-8">Wann ist welche Fachrichtung relevant?</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {specialties.map((s) => (
                <Link
                  key={s.name}
                  href={s.href}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-donau-blau)] hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg wohin-gradient opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium text-[var(--color-medizin-navy)] group-hover:text-[var(--color-donau-blau)] transition-colors leading-snug">{s.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* VIA Selten */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden">
              <div className="selten-gradient p-8 md:p-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs text-white mb-4">
                    WohinMedizin Selten
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Wenn der Weg länger ist, braucht es bessere Orientierung.
                  </h2>
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Wenn Beschwerden lange ungeklärt bleiben, bündelt WohinMedizin Selten Informationen, spezialisierte Anlaufstellen und Fragen für den nächsten Arzttermin.
                  </p>
                  <Link
                    href="/selten"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[var(--color-selten-violett)] font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    Zu WohinMedizin Selten
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-[var(--color-morgen-hellblau)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[var(--color-medizin-navy)] mb-2">Häufige Gesundheitsfragen</h2>
            <p className="text-[var(--color-muted)] mb-8">Verständliche Antworten für häufige Unsicherheiten.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {faqs.map((faq) => (
                <Link
                  key={faq}
                  href={`/wissen/${faq.toLowerCase().replace(/[?\s]+/g, "-")}`}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-donau-blau)] hover:shadow-sm transition-all group"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span className="text-sm text-[var(--color-medizin-navy)] group-hover:text-[var(--color-donau-blau)] transition-colors">{faq}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Transparency */}
        <section className="py-12 bg-white border-t border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-[var(--color-muted)] max-w-2xl mx-auto">
              Einige Themenbereiche werden von Partnern unterstützt. Die redaktionelle Verantwortung liegt bei WohinMedizin.at. Partnerinhalte werden klar gekennzeichnet und beeinflussen keine Orientierungsergebnisse.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
