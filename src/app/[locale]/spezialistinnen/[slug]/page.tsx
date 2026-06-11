import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Placeholder until Payload CMS data is connected
const mockDoctor = {
  name: 'Dr. Maria Mustermann',
  title: 'Dr.',
  specialty: 'Dermatologie',
  insuranceType: 'insuranceKasseUndWahl',
  region: 'Wien',
  address: 'Musterstraße 12, 1010 Wien',
  phone: '+43 1 234 5678',
  website: 'https://example.at',
  languages: ['Deutsch', 'Englisch'],
  verified: true,
  tier: 'plus',
  bio: 'Mein Ziel ist es, Patient:innen medizinisch sorgfältig zu behandeln und ihnen die Hintergründe ihrer Beschwerden verständlich zu erklären. Eine gute Diagnose beginnt für mich mit genauem Zuhören, klarer Untersuchung und einer Therapieempfehlung, die zur individuellen Situation passt.',
  focusAreas: [
    'Hautkrebsvorsorge und Dermatoskopie',
    'Chronische Hauterkrankungen (Psoriasis, Ekzem, Akne)',
    'Allergologische Diagnostik',
    'Ästhetische Dermatologie',
  ],
  appointmentProcess: [
    'Termin online oder telefonisch vereinbaren',
    'Vorhandene Befunde und e-card mitbringen',
    'Sorgfältige Untersuchung und verständliche Beratung',
    'Gemeinsame Besprechung der nächsten Schritte',
  ],
}

const insuranceBadgeColor: Record<string, string> = {
  insuranceKasseUndWahl: 'bg-green-50 text-green-700 border-green-200',
  insuranceKasse: 'bg-green-50 text-green-700 border-green-200',
  insuranceWahl: 'bg-blue-50 text-blue-700 border-blue-200',
  insurancePrivat: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default async function DoctorProfilePage() {
  const t = await getTranslations('specialist')
  const doc = mockDoctor
  const badgeClass = insuranceBadgeColor[doc.insuranceType] ?? 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-[var(--color-morgen-hellblau)] border-b border-[var(--color-border)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

              {/* Photo placeholder */}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0 overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-muted)]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {doc.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-[var(--color-donau-blau)] text-white px-2.5 py-1 rounded-full">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {t('verifiedProfile')}
                    </span>
                  )}
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass}`}>
                    {t(doc.insuranceType as Parameters<typeof t>[0])}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-1">
                  {doc.name}
                </h1>
                <p className="text-[var(--color-donau-blau)] font-medium mb-3">{doc.specialty} · {doc.region}</p>

                <p className="text-[var(--color-muted)] text-sm leading-relaxed max-w-xl mb-6">
                  {doc.bio}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${doc.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl wohin-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {t('callPractice')}
                  </a>
                  {doc.website && (
                    <a
                      href={doc.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-medizin-navy)] font-semibold text-sm hover:bg-[var(--color-morgen-hellblau)] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      {t('visitWebsite')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Main info */}
            <div className="lg:col-span-2 space-y-10">

              {/* Focus areas */}
              <div>
                <h2 className="text-lg font-bold text-[var(--color-medizin-navy)] mb-4">{t('focusAreasHeading')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doc.focusAreas.map((area) => (
                    <div key={area} className="flex items-start gap-3 p-4 bg-[var(--color-morgen-hellblau)] rounded-xl border border-[var(--color-border)]">
                      <div className="w-5 h-5 rounded-full wohin-gradient flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <span className="text-sm text-[var(--color-medizin-navy)]">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointment process */}
              <div>
                <h2 className="text-lg font-bold text-[var(--color-medizin-navy)] mb-4">{t('appointmentHeading')}</h2>
                <div className="space-y-3">
                  {doc.appointmentProcess.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white border border-[var(--color-border)] rounded-xl">
                      <div className="w-7 h-7 rounded-full wohin-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-[var(--color-muted)] leading-relaxed pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance info */}
              <div>
                <h2 className="text-lg font-bold text-[var(--color-medizin-navy)] mb-4">{t('insuranceHeading')}</h2>
                <div className={`p-5 rounded-xl border ${badgeClass}`}>
                  <p className="font-semibold text-sm mb-1">{t(doc.insuranceType as Parameters<typeof t>[0])}</p>
                  <p className="text-xs leading-relaxed opacity-80">
                    {t('insuranceNote')}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-[var(--color-warmweiss)] border border-[var(--color-border)] rounded-xl">
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  {t('profileDisclaimer')}
                </p>
              </div>
            </div>

            {/* Right: Contact sidebar */}
            <div className="space-y-4">

              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 space-y-4 sticky top-20">
                <h3 className="font-bold text-[var(--color-medizin-navy)] text-sm">{t('contactHeading')}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] mt-0.5 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[var(--color-muted)]">{doc.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a href={`tel:${doc.phone}`} className="text-[var(--color-donau-blau)] hover:underline">{doc.phone}</a>
                  </div>

                  {doc.languages.length > 0 && (
                    <div className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] mt-0.5 shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="text-[var(--color-muted)]">{doc.languages.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                  <a
                    href={`tel:${doc.phone}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl wohin-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    {t('callNow')}
                  </a>
                  {doc.website && (
                    <a
                      href={doc.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-morgen-hellblau)] border border-[var(--color-border)] text-[var(--color-medizin-navy)] font-semibold text-sm hover:bg-[var(--color-border)] transition-colors"
                    >
                      {t('visitWebsite')}
                    </a>
                  )}
                </div>
              </div>

              {/* Back link */}
              <Link
                href="/spezialistinnen"
                className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-medizin-navy)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {t('allSpecialists')}
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[var(--color-border)] px-4 py-3 flex gap-3">
        <a
          href={`tel:${doc.phone}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl wohin-gradient text-white font-semibold text-sm"
        >
          {t('callNow')}
        </a>
        {doc.website && (
          <a
            href={doc.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[var(--color-morgen-hellblau)] border border-[var(--color-border)] text-[var(--color-medizin-navy)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        )}
      </div>

      <Footer />
    </>
  )
}
