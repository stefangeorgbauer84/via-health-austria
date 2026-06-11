import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default async function HomePage() {
  const t = await getTranslations()

  const trustItems = t.raw('trust.items') as Array<{ title: string; text: string }>
  const quickTopicItems = t.raw('quickTopics.items') as string[]
  const steps = t.raw('howItWorks.steps') as Array<{ title: string; text: string }>
  const specialties = t.raw('specialtiesSection.items') as Array<{ name: string; sub: string; href: string }>
  const faqs = t.raw('faqsSection.items') as Array<{ q: string; href: string }>
  const features = t.raw('forDoctorsSection.features') as string[]
  const profiles = t.raw('forDoctorsSection.profiles') as Array<{ label: string; detail: string }>

  const trustIcons = [
    <svg key="shield" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>,
    <svg key="check" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
    </svg>,
    <svg key="lock" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>,
    <svg key="home" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>,
  ]

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[var(--color-morgen-hellblau)]">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 wohin-gradient blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 bg-[var(--color-selten-violett)] blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-muted)] mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--color-alpen-mint)]" aria-hidden="true" />
                {t('hero.badge')}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-medizin-navy)] leading-tight mb-6">
                {t('hero.heading')}{' '}
                <span className="wohin-gradient-text">{t('hero.headingAccent')}</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-muted)] leading-relaxed mb-8 max-w-2xl">
                {t('hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/navigator"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl wohin-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                  {t('hero.ctaPrimary')}
                </Link>
                <Link
                  href="/themen"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[var(--color-border)] text-[var(--color-medizin-navy)] font-semibold hover:bg-[var(--color-morgen-hellblau)] transition-colors"
                >
                  {t('hero.ctaSecondary')}
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-muted)]">
                {[t('hero.noDiagnosis'), t('hero.noRegistration'), t('hero.checkedContent'), t('hero.austrianContext')].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-alpen-mint)]" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Anchors ── */}
        <section className="bg-white border-b border-[var(--color-border)] py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustItems.map((item, i) => (
                <div key={item.title} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-morgen-hellblau)] flex items-center justify-center text-[var(--color-donau-blau)]">
                    {trustIcons[i]}
                  </div>
                  <h3 className="font-semibold text-[var(--color-medizin-navy)] text-sm">{item.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Topics ── */}
        <section className="bg-[var(--color-warmweiss)] border-b border-[var(--color-border)] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-3">
              {t('quickTopics.heading')}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickTopicItems.map((topic) => (
                <Link
                  key={topic}
                  href={`/navigator?q=${encodeURIComponent(topic)}`}
                  className="px-3 py-1.5 rounded-full bg-white text-[var(--color-medizin-navy)] text-sm hover:bg-[var(--color-donau-blau)] hover:text-white transition-colors border border-[var(--color-border)]"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-3">
                {t('howItWorks.heading')}
              </h2>
              <p className="text-[var(--color-muted)] leading-relaxed">{t('howItWorks.subheading')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col gap-4">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(100%+1rem)] w-8 border-t-2 border-dashed border-[var(--color-border)]" aria-hidden="true" />
                  )}
                  <div className="w-10 h-10 rounded-full wohin-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-medizin-navy)] mb-2">{step.title}</h3>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/navigator"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl wohin-gradient text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                {t('howItWorks.cta')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Specialties ── */}
        <section className="py-20 bg-[var(--color-morgen-hellblau)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-3">
                {t('specialtiesSection.heading')}
              </h2>
              <p className="text-[var(--color-muted)]">{t('specialtiesSection.subheading')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {specialties.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex flex-col gap-1.5 p-5 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-donau-blau)] hover:shadow-sm transition-all group"
                >
                  <span className="text-sm font-semibold text-[var(--color-medizin-navy)] group-hover:text-[var(--color-donau-blau)] transition-colors leading-snug">
                    {s.name}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">{s.sub}</span>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/fachrichtungen" className="text-sm font-medium text-[var(--color-donau-blau)] hover:underline inline-flex items-center gap-1">
                {t('specialtiesSection.allLink')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── WohinMedizin Selten ── */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden">
              <div className="selten-gradient p-8 md:p-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs text-white mb-4">
                    {t('rareSection.badge')}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {t('rareSection.heading')}
                  </h2>
                  <p className="text-white/80 mb-6 leading-relaxed">{t('rareSection.text')}</p>
                  <Link
                    href="/selten"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[var(--color-selten-violett)] font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    {t('rareSection.cta')}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="py-20 bg-[var(--color-warmweiss)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-3">
                {t('faqsSection.heading')}
              </h2>
              <p className="text-[var(--color-muted)]">{t('faqsSection.subheading')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {faqs.map(({ q, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-start gap-3 p-5 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-donau-blau)] hover:shadow-sm transition-all group"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] mt-0.5 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span className="text-sm text-[var(--color-medizin-navy)] group-hover:text-[var(--color-donau-blau)] transition-colors leading-snug">
                    {q}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── For Doctors B2B ── */}
        <section className="py-20 bg-white border-t border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-[var(--color-morgen-hellblau)] rounded-full px-3 py-1 text-xs text-[var(--color-donau-blau)] font-medium mb-4">
                  {t('forDoctorsSection.badge')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-4">
                  {t('forDoctorsSection.heading')}
                </h2>
                <p className="text-[var(--color-muted)] leading-relaxed mb-6">
                  {t('forDoctorsSection.description')}
                </p>
                <ul className="space-y-2 mb-8">
                  {features.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-alpen-mint)] shrink-0" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/fuer-aerzte"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[var(--color-donau-blau)] text-[var(--color-donau-blau)] font-semibold text-sm hover:bg-[var(--color-morgen-hellblau)] transition-colors"
                >
                  {t('forDoctorsSection.cta')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="bg-[var(--color-morgen-hellblau)] rounded-2xl p-8 space-y-4">
                {profiles.map((p) => (
                  <div key={p.label} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[var(--color-border)]">
                    <div className="w-2 h-2 rounded-full wohin-gradient mt-1.5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-medizin-navy)]">{p.label}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{p.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Partner Transparency ── */}
        <section className="py-10 bg-[var(--color-morgen-hellblau)] border-t border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-[var(--color-muted)] max-w-2xl mx-auto">{t('partnerNote')}</p>
          </div>
        </section>

      </main>

      {/* ── Mobile Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[var(--color-border)] px-4 py-3 flex gap-3">
        <Link
          href="/navigator"
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl wohin-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          {t('mobileCta.startOrientation')}
        </Link>
        <a
          href="tel:+43"
          className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[var(--color-morgen-hellblau)] border border-[var(--color-border)] text-[var(--color-medizin-navy)]"
          aria-label={t('mobileCta.callLabel')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </a>
      </div>

      <Footer />
    </>
  )
}
