import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="bg-[var(--color-medizin-navy)] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg wohin-gradient flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="2.5" fill="white" />
                  <path d="M9 3 L9 6.5 M9 11.5 L9 15 M3 9 L6.5 9 M11.5 9 L15 9"
                    stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-white">
                WohinMedizin<span className="text-[var(--color-alpen-mint)]">.at</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">{t('themesHeading')}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/beschwerden" className="hover:text-white transition-colors">{t('symptoms')}</Link></li>
              <li><Link href="/erkrankungen" className="hover:text-white transition-colors">{t('diseases')}</Link></li>
              <li><Link href="/fachrichtungen" className="hover:text-white transition-colors">{t('specialties')}</Link></li>
              <li><Link href="/selten" className="hover:text-white transition-colors">{t('rare')}</Link></li>
              <li><Link href="/gesundheitssystem" className="hover:text-white transition-colors">{t('healthSystem')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">{t('platformHeading')}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/navigator" className="hover:text-white transition-colors">{t('navigatorLink')}</Link></li>
              <li><Link href="/fuer-aerzte" className="hover:text-white transition-colors">{t('forDoctors')}</Link></li>
              <li><Link href="/fuer-partner" className="hover:text-white transition-colors">{t('forPartners')}</Link></li>
              <li><Link href="/ueber-uns" className="hover:text-white transition-colors">{t('about')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/80">{t('legalHeading')}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/datenschutz" className="hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/impressum" className="hover:text-white transition-colors">{t('imprint')}</Link></li>
              <li><Link href="/nutzungsbedingungen" className="hover:text-white transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-white/40">{t('copyright')}</p>
          <p className="text-xs text-white/40">{t('checkedContent')}</p>
        </div>
      </div>
    </footer>
  )
}
