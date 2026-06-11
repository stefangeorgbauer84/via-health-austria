'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition, useState, useRef, useEffect } from 'react'
import { locales, type Locale, rtlLocales } from '@/i18n/routing'

const LANGUAGE_GROUPS: { key: string; label: string; locales: Locale[] }[] = [
  {
    key: 'official',
    label: 'Amtssprache / Official',
    locales: ['de'],
  },
  {
    key: 'minority',
    label: 'Minderheitensprachen',
    locales: ['hr', 'sl', 'hu', 'cs', 'sk', 'rmn'],
  },
  {
    key: 'migration',
    label: 'Migrationssprachen',
    locales: ['bs', 'sr', 'tr', 'ar', 'ro', 'pl', 'ru', 'uk'],
  },
  {
    key: 'international',
    label: 'International',
    locales: ['en'],
  },
]

const LOCALE_LABELS: Record<Locale, { native: string; roman?: string }> = {
  de:  { native: 'Deutsch' },
  en:  { native: 'English' },
  hr:  { native: 'Hrvatski' },
  sl:  { native: 'Slovenščina' },
  hu:  { native: 'Magyar' },
  cs:  { native: 'Čeština' },
  sk:  { native: 'Slovenčina' },
  rmn: { native: 'Romani' },
  bs:  { native: 'Bosanski' },
  sr:  { native: 'Српски', roman: 'Srpski' },
  tr:  { native: 'Türkçe' },
  ar:  { native: 'العربية', roman: 'Arabic' },
  ro:  { native: 'Română' },
  pl:  { native: 'Polski' },
  ru:  { native: 'Русский', roman: 'Russkiy' },
  uk:  { native: 'Українська', roman: 'Ukrayinska' },
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function switchLocale(next: Locale) {
    setIsOpen(false)
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const current = LOCALE_LABELS[locale]
  const isRtl = rtlLocales.includes(locale)

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button — always visible, prominent */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Sprache wählen / Select language"
        disabled={isPending}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm
          transition-all duration-150 select-none
          ${isOpen
            ? 'border-[var(--color-donau-blau)] bg-[var(--color-morgen-hellblau)] text-[var(--color-donau-blau)]'
            : 'border-[var(--color-border)] bg-white text-[var(--color-medizin-navy)] hover:border-[var(--color-donau-blau)] hover:bg-[var(--color-morgen-hellblau)]'
          }
          ${isPending ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
        `}
      >
        {/* Globe icon */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        {/* Current language native name */}
        <span
          className={`max-w-[7rem] truncate leading-tight ${isRtl ? 'text-right' : ''}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {current.native}
        </span>

        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Sprache wählen"
          className="
            absolute right-0 top-full mt-2 z-[200]
            w-[340px] sm:w-[420px]
            bg-white rounded-2xl border border-[var(--color-border)]
            shadow-xl overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-morgen-hellblau)]">
            <p className="text-xs font-semibold text-[var(--color-medizin-navy)] uppercase tracking-wider">
              Sprache wählen · Select language
            </p>
          </div>

          <div className="p-3 max-h-[70vh] overflow-y-auto">
            {LANGUAGE_GROUPS.map((group) => (
              <div key={group.key} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] px-2 mb-1.5">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {group.locales.map((loc) => {
                    const label = LOCALE_LABELS[loc]
                    const isActive = loc === locale
                    const isRtlLocale = rtlLocales.includes(loc)
                    return (
                      <button
                        key={loc}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => switchLocale(loc)}
                        className={`
                          flex flex-col px-3 py-2.5 rounded-xl text-left transition-all
                          ${isActive
                            ? 'bg-[var(--color-donau-blau)] text-white'
                            : 'hover:bg-[var(--color-morgen-hellblau)] text-[var(--color-medizin-navy)]'
                          }
                        `}
                        dir={isRtlLocale ? 'rtl' : 'ltr'}
                      >
                        <span className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : ''}`}>
                          {label.native}
                        </span>
                        {label.roman && (
                          <span className={`text-[11px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[var(--color-muted)]'}`}
                            dir="ltr"
                          >
                            {label.roman}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] text-white/70 mt-0.5">✓ aktiv</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-warmweiss)]">
            <p className="text-[10px] text-[var(--color-muted)] leading-relaxed">
              Einige Übersetzungen sind maschinell erstellt. Fachliche Inhalte sollten von Gesundheitspersonal geprüft werden.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
