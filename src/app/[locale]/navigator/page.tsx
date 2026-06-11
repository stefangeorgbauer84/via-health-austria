'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface FachRichtung {
  fachrichtung: string
  warum: string
}

interface NavigatorResult {
  zusammenfassung: string
  ersteAnlaufstelle: {
    bezeichnung: string
    begruendung: string
  }
  relevanteRichtungen: FachRichtung[]
  roteFlaggen: string[]
  naechsteSchritte: string[]
  hinweis: string
}

export default function NavigatorPage() {
  const t = useTranslations('navigator')
  const [anliegen, setAnliegen] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NavigatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!anliegen.trim() || loading) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/navigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anliegen }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Ein Fehler ist aufgetreten.')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Keine Antwort erhalten.')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
      }

      const parsed: NavigatorResult = JSON.parse(accumulated)
      setResult(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#F3FAFF' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#123047' }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #1E88E5, #3DDC97)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('backToHome')}
            </span>
          </a>
          <span className="text-sm" style={{ color: '#3DDC97' }}>
            {t('label')}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: '#123047' }}
          >
            {t('heading')}
          </h1>
          <p className="text-lg" style={{ color: '#4A6080' }}>
            {t('description')}
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: '#FFFDF8', border: '1px solid #D6EAF8' }}
          >
            <textarea
              ref={textareaRef}
              value={anliegen}
              onChange={(e) => setAnliegen(e.target.value)}
              placeholder={t('placeholder')}
              rows={4}
              className="w-full px-6 pt-5 pb-3 text-base resize-none focus:outline-none"
              style={{ backgroundColor: 'transparent', color: '#123047' }}
              disabled={loading}
            />
            <div className="px-6 pb-4 flex items-center justify-between">
              <span className="text-sm" style={{ color: '#8AABB8' }}>
                {anliegen.length > 0 ? t('charCount', { count: anliegen.length }) : t('inputHint')}
              </span>
              <button
                type="submit"
                disabled={loading || anliegen.trim().length < 5}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{
                  background: 'linear-gradient(90deg, #1E88E5, #3DDC97)',
                }}
              >
                {loading ? t('analyzing') : t('submit')}
              </button>
            </div>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full animate-bounce"
                  style={{
                    backgroundColor: '#1E88E5',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: '#4A6080' }}>
              {t('loadingText')}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-5 py-4 text-sm"
            style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFCDD2', color: '#C62828' }}
          >
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-5">
            {/* Zusammenfassung */}
            <div
              className="rounded-2xl px-6 py-5"
              style={{ backgroundColor: '#FFFDF8', border: '1px solid #D6EAF8' }}
            >
              <p className="text-base" style={{ color: '#123047' }}>
                {result.zusammenfassung}
              </p>
            </div>

            {/* Erste Anlaufstelle */}
            <div
              className="rounded-2xl px-6 py-5"
              style={{
                background: 'linear-gradient(135deg, #E3F2FD, #E8FBF3)',
                border: '1px solid #B3E5FC',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1E88E5' }}>
                  {t('firstContactLabel')}
                </span>
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: '#123047' }}>
                {result.ersteAnlaufstelle.bezeichnung}
              </p>
              <p className="text-sm" style={{ color: '#4A6080' }}>
                {result.ersteAnlaufstelle.begruendung}
              </p>
            </div>

            {/* Relevante Fachrichtungen */}
            {result.relevanteRichtungen.length > 0 && (
              <div
                className="rounded-2xl px-6 py-5"
                style={{ backgroundColor: '#FFFDF8', border: '1px solid #D6EAF8' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1E88E5' }}>
                    {t('specialtiesLabel')}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {result.relevanteRichtungen.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                        style={{ backgroundColor: '#1E88E5' }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#123047' }}>
                          {r.fachrichtung}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: '#4A6080' }}>
                          {r.warum}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rote Flaggen */}
            {result.roteFlaggen.length > 0 && (
              <div
                className="rounded-2xl px-6 py-5"
                style={{ backgroundColor: '#FFF5F5', border: '1px solid #FFCDD2' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF6B6B' }}>
                    {t('redFlagsLabel')}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {result.roteFlaggen.map((flag, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: '#C62828' }}>
                      <span className="flex-shrink-0 mt-1" style={{ color: '#FF6B6B' }}>•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nächste Schritte */}
            {result.naechsteSchritte.length > 0 && (
              <div
                className="rounded-2xl px-6 py-5"
                style={{ backgroundColor: '#FFFDF8', border: '1px solid #D6EAF8' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3DDC97' }}>
                    {t('nextStepsLabel')}
                  </span>
                </div>
                <ol className="flex flex-col gap-3">
                  {result.naechsteSchritte.map((schritt, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: '#123047' }}>
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: '#3DDC97' }}
                      >
                        {i + 1}
                      </span>
                      {schritt}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Pflichthinweis */}
            <p className="text-xs text-center px-4" style={{ color: '#8AABB8' }}>
              {result.hinweis}
            </p>

            {/* Neue Anfrage */}
            <div className="text-center pt-2">
              <button
                onClick={() => { setResult(null); setAnliegen(''); textareaRef.current?.focus() }}
                className="text-sm font-medium underline underline-offset-2"
                style={{ color: '#1E88E5' }}
              >
                {t('newQuery')}
              </button>
            </div>
          </div>
        )}

        {/* Privacy note */}
        {!result && !loading && (
          <p className="text-xs text-center mt-8" style={{ color: '#8AABB8' }}>
            {t('noStorage')}
          </p>
        )}
      </div>
    </main>
  )
}
