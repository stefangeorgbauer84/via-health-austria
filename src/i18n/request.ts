import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const validLocale = routing.locales.includes(locale as typeof routing.locales[number])
    ? locale
    : routing.defaultLocale

  let messages
  try {
    messages = (await import(`../../messages/${validLocale}.json`)).default
  } catch {
    // Fallback to English if no translation file exists for this locale
    messages = (await import(`../../messages/en.json`)).default
  }

  return {
    locale: validLocale || routing.defaultLocale,
    messages,
  }
})
