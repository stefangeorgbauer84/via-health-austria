import { defineRouting } from 'next-intl/routing'

export const locales = [
  'de',   // Deutsch (Amtssprache, Standard)
  'en',   // English (international)
  // Anerkannte Minderheitensprachen in Österreich
  'hr',   // Hrvatski (Kroatisch)
  'sl',   // Slovenščina (Slowenisch)
  'hu',   // Magyar (Ungarisch)
  'cs',   // Čeština (Tschechisch)
  'sk',   // Slovenčina (Slowakisch)
  'rmn',  // Romani / Romanes
  // Häufige Migrationssprachen
  'bs',   // Bosanski (Bosnisch)
  'sr',   // Srpski (Serbisch)
  'tr',   // Türkçe (Türkisch)
  'ar',   // العربية (Arabisch) — RTL
  'ro',   // Română (Rumänisch)
  'pl',   // Polski (Polnisch)
  'ru',   // Русский (Russisch)
  'uk',   // Українська (Ukrainisch)
] as const

export type Locale = (typeof locales)[number]

export const rtlLocales: Locale[] = ['ar']

export const routing = defineRouting({
  locales,
  defaultLocale: 'de',
  localePrefix: 'as-needed',
})
