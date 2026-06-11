import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getDiseaseBySlug } from '@/lib/diseases'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const disease = await getDiseaseBySlug(slug, locale)
  if (!disease) return { title: 'Erkrankung nicht gefunden' }
  return {
    title: `${disease.name} — WohinMedizin.at`,
    description: disease.brief_description?.slice(0, 160) ?? `Informationen zu ${disease.name} (${disease.orpha_code}).`,
  }
}

const ORGAN_LABELS: Record<string, string> = {
  neurological:               'Neurologisch',
  cardiovascular:             'Herz & Gefäße',
  musculoskeletal:            'Bewegungsapparat',
  hematological_immunological:'Blut & Immunsystem',
  endocrine_metabolic:        'Stoffwechsel',
  dermatological:             'Haut',
  gastrointestinal:           'Magen-Darm',
  respiratory:                'Atemwege',
  urogenital:                 'Niere & Harnwege',
  visual:                     'Augen',
  auditory:                   'Ohren',
  reproductive:               'Reproduktion',
  psychiatric:                'Psychiatrisch',
  multisystemic:              'Multisystemisch',
  oncological:                'Onkologisch',
}

const INHERITANCE_LABELS: Record<string, string> = {
  autosomal_dominant:  'Autosomal-dominant',
  autosomal_recessive: 'Autosomal-rezessiv',
  x_dominant:          'X-chromosomal dominant',
  x_recessive:         'X-chromosomal rezessiv',
  mitochondrial:       'Mitochondrial',
  multifactorial:      'Multifaktoriell',
  de_novo:             'De novo',
  non_genetic:         'Nicht genetisch',
  unknown:             'Unbekannt',
}

const ONSET_LABELS: Record<string, string> = {
  congenital:   'Angeboren',
  neonatal:     'Neugeborenenperiode',
  infancy:      'Säuglingsalter',
  childhood:    'Kindesalter',
  adolescence:  'Jugendalter',
  young_adult:  'Frühes Erwachsenenalter',
  middle_age:   'Mittleres Erwachsenenalter',
  elderly:      'Höheres Alter',
  all_ages:     'Alle Altersgruppen',
}

const CATEGORY_LABELS: Record<string, string> = {
  very_common: 'Sehr häufig (>80%)',
  common:      'Häufig (30–79%)',
  occasional:  'Gelegentlich (5–29%)',
  rare:        'Selten (1–4%)',
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'orpha' | 'icd' | 'omim' }) {
  const styles = {
    default: 'bg-[var(--color-morgen-hellblau)] text-[var(--color-donau-blau)]',
    orpha:   'bg-purple-50 text-purple-700',
    icd:     'bg-blue-50 text-blue-700',
    omim:    'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

function SidebarItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1.5">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default async function DiseaseDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const disease = await getDiseaseBySlug(slug, locale)
  if (!disease) notFound()

  const orphaNum = disease.orpha_code?.replace('ORPHA:', '')
  const orphanetUrl = orphaNum
    ? `https://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=DE&Expert=${orphaNum}`
    : null

  return (
    <>
      <Header />
      <main className="flex-1">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Link href="/" className="hover:text-[var(--color-donau-blau)] transition-colors">WohinMedizin</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              <Link href="/selten" className="hover:text-[var(--color-donau-blau)] transition-colors">Seltene Erkrankungen</Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              <span className="text-[var(--color-medizin-navy)] font-medium line-clamp-1">{disease.name}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-white pb-8 pt-8 border-b border-[var(--color-border)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {disease.orpha_code && <Badge variant="orpha">ORPHA:{orphaNum}</Badge>}
              {disease.icd10_code && <Badge variant="icd">ICD-10: {disease.icd10_code}</Badge>}
              {disease.omim_code  && <Badge variant="omim">OMIM: {disease.omim_code}</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-medizin-navy)] mb-3 leading-tight">
              {disease.name}
            </h1>

            {disease.aliases.length > 0 && (
              <p className="text-sm text-[var(--color-muted)] mb-4">
                Auch bekannt als: {disease.aliases.join(', ')}
              </p>
            )}

            {disease.organ_systems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {disease.organ_systems.map((os) => (
                  <span key={os} className="text-xs bg-[var(--color-morgen-hellblau)] text-[var(--color-donau-blau)] border border-[var(--color-border)] px-3 py-1 rounded-full">
                    {ORGAN_LABELS[os] ?? os}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="py-10 bg-[var(--color-warmweiss)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Hauptinhalt */}
              <div className="lg:col-span-2 space-y-8">

                {/* Kurzbeschreibung */}
                {disease.brief_description && (
                  <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold text-[var(--color-medizin-navy)] mb-3">
                      Was ist {disease.name}?
                    </h2>
                    <p className="text-[var(--color-muted)] leading-relaxed text-sm">
                      {disease.brief_description}
                    </p>
                  </div>
                )}

                {/* Symptome (HPO) */}
                {(disease.hpo_terms.length > 0 || disease.symptoms.length > 0) && (
                  <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold text-[var(--color-medizin-navy)] mb-4">
                      Symptome & Beschwerden
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {(disease.symptoms.length > 0 ? disease.symptoms : []).map((s) => (
                        <span
                          key={s.hpo_code}
                          className="text-xs bg-[var(--color-warmweiss)] border border-[var(--color-border)] text-[var(--color-medizin-navy)] px-3 py-1.5 rounded-full"
                          title={`HPO: ${s.hpo_code} · ${CATEGORY_LABELS[s.category] ?? s.category}`}
                        >
                          {s.name}
                        </span>
                      ))}
                      {disease.symptoms.length === 0 && disease.hpo_terms.slice(0, 20).map((h) => (
                        <span
                          key={h.hpo_id}
                          className="text-xs bg-[var(--color-warmweiss)] border border-[var(--color-border)] text-[var(--color-medizin-navy)] px-3 py-1.5 rounded-full"
                          title={h.hpo_id}
                        >
                          {h.hpo_label}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-3">
                      Symptome nach Human Phenotype Ontology (HPO). Nicht alle Betroffenen zeigen alle Symptome.
                    </p>
                  </div>
                )}

                {/* Hinweis auf redaktionelle Aufbereitung */}
                <div className="bg-[var(--color-morgen-hellblau)] rounded-xl p-6 border border-[var(--color-border)]">
                  <div className="flex gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-donau-blau)] shrink-0 mt-0.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-medizin-navy)] mb-1">
                        Dieser Eintrag wird redaktionell aufbereitet
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        Die Basisinformationen stammen aus der Orphanet-Datenbank. Detaillierte Beschreibungen,
                        Behandlungsoptionen und österreichische Anlaufstellen werden schrittweise ergänzt.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                {disease.disclaimer && (
                  <div className="rounded-xl border border-[var(--color-border)] p-5 bg-white">
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                      <strong className="text-[var(--color-medizin-navy)]">Medizinischer Hinweis:</strong>{' '}
                      {disease.disclaimer}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                  <h2 className="text-sm font-bold text-[var(--color-medizin-navy)] uppercase tracking-wider mb-5">
                    Klassifikation & Codes
                  </h2>
                  <dl className="space-y-4">
                    {disease.orpha_code && (
                      <SidebarItem label="ORPHA-Code">
                        {orphanetUrl ? (
                          <a href={orphanetUrl} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-mono text-[var(--color-selten-violett)] hover:underline">
                            {disease.orpha_code}
                          </a>
                        ) : (
                          <span className="text-sm font-mono text-[var(--color-selten-violett)]">{disease.orpha_code}</span>
                        )}
                      </SidebarItem>
                    )}
                    {disease.icd10_code && (
                      <SidebarItem label="ICD-10-Code">
                        <span className="text-sm font-mono text-[var(--color-medizin-navy)]">{disease.icd10_code}</span>
                      </SidebarItem>
                    )}
                    {disease.omim_code && (
                      <SidebarItem label="OMIM">
                        <a href={`https://www.omim.org/entry/${disease.omim_code}`} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-mono text-[var(--color-donau-blau)] hover:underline">
                          {disease.omim_code}
                        </a>
                      </SidebarItem>
                    )}
                  </dl>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                  <h2 className="text-sm font-bold text-[var(--color-medizin-navy)] uppercase tracking-wider mb-5">
                    Epidemiologie
                  </h2>
                  <dl className="space-y-4">
                    {disease.prevalence && (
                      <SidebarItem label="Prävalenz">
                        <span className="text-sm text-[var(--color-medizin-navy)]">{disease.prevalence}</span>
                      </SidebarItem>
                    )}
                    {disease.inheritance.length > 0 && (
                      <SidebarItem label="Vererbung">
                        <div className="flex flex-wrap gap-1">
                          {disease.inheritance.filter((v) => v !== 'unknown').map((v) => (
                            <span key={v} className="text-xs bg-[var(--color-morgen-hellblau)] text-[var(--color-donau-blau)] px-2 py-0.5 rounded-full">
                              {INHERITANCE_LABELS[v] ?? v}
                            </span>
                          ))}
                        </div>
                      </SidebarItem>
                    )}
                    {disease.age_of_onset.length > 0 && (
                      <SidebarItem label="Erkrankungsalter">
                        <div className="flex flex-wrap gap-1">
                          {disease.age_of_onset.filter((v) => v !== 'all_ages').map((v) => (
                            <span key={v} className="text-xs bg-[var(--color-morgen-hellblau)] text-[var(--color-donau-blau)] px-2 py-0.5 rounded-full">
                              {ONSET_LABELS[v] ?? v}
                            </span>
                          ))}
                        </div>
                      </SidebarItem>
                    )}
                  </dl>
                </div>

                {/* Externe Links */}
                <div className="bg-white rounded-xl p-6 border border-[var(--color-border)]">
                  <h2 className="text-sm font-bold text-[var(--color-medizin-navy)] uppercase tracking-wider mb-4">
                    Weiterführende Quellen
                  </h2>
                  <ul className="space-y-3">
                    {orphanetUrl && (
                      <li>
                        <a href={orphanetUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[var(--color-donau-blau)] hover:underline">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                          Orphanet-Eintrag
                        </a>
                      </li>
                    )}
                    {disease.omim_code && (
                      <li>
                        <a href={`https://www.omim.org/entry/${disease.omim_code}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[var(--color-donau-blau)] hover:underline">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                          OMIM
                        </a>
                      </li>
                    )}
                    <li>
                      <a href={`https://clinicaltrials.gov/search?cond=${encodeURIComponent(disease.name)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--color-donau-blau)] hover:underline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                        Klinische Studien (ClinicalTrials.gov)
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Attribution */}
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Daten: Orphanet (INSERM US14) ·{' '}
                  <a href="https://creativecommons.org/licenses/by/4.0" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a>
                </p>
              </aside>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
