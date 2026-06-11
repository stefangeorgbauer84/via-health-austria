/**
 * WohinMedizin — Orphadata Import (REST API Version)
 *
 * Importiert strukturierte Krankheitsdaten aus der Orphadata API in Payload CMS.
 * Nutzt Payload REST API (kein Local API-Import) für Node 24 Kompatibilität.
 *
 * Voraussetzungen:
 *   Dev-Server muss laufen: npm run dev
 *   Admin-User in Payload angelegt
 *
 * Env (.env.local):
 *   PAYLOAD_ADMIN_EMAIL     — E-Mail des Admin-Users
 *   PAYLOAD_ADMIN_PASSWORD  — Passwort des Admin-Users
 *   PAYLOAD_URL             — Optional, Standard: http://localhost:3003
 *
 * Ausführen:
 *   npx tsx scripts/orphadata/import.ts --dry-run
 *   npx tsx scripts/orphadata/import.ts --limit 50
 *   npx tsx scripts/orphadata/import.ts --cluster neuro --limit 100
 *   npx tsx scripts/orphadata/import.ts
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(process.cwd(), '.env.local') })

// ─── CLI-Argumente ────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const LIMIT = (() => {
  const i = args.indexOf('--limit')
  return i !== -1 ? parseInt(args[i + 1], 10) : Infinity
})()
const CLUSTER = (() => {
  const i = args.indexOf('--cluster')
  return i !== -1 ? args[i + 1] : null
})()

const API_DELAY_MS = 350
const PAYLOAD_URL  = process.env.PAYLOAD_URL ?? 'http://localhost:3003'
const ORPHADATA    = 'https://api.orphadata.com'

// ─── Cluster-Filter ───────────────────────────────────────────────────────────

const CLUSTER_KEYWORDS: Record<string, string[]> = {
  neuro:        ['neurolog', 'neuromuscul', 'brain', 'cerebell', 'spinocereb'],
  metabolic:    ['metaboli', 'lysosom', 'peroxisom', 'mitochond'],
  cardiac:      ['cardiac', 'cardiomyop', 'vascular', 'aortic'],
  hematologic:  ['hematol', 'hemoglobin', 'thrombo', 'anemia', 'leukemia'],
  dermatologic: ['dermat', 'ichthyos', 'epidermolys'],
  skeletal:     ['skeletal', 'chondrodyspl', 'osteog', 'arthrogryp'],
  immune:       ['immuno', 'autoinflam', 'complement'],
  kidney:       ['renal', 'nephro', 'kidney'],
}

// ─── Orphadata API-Typen ──────────────────────────────────────────────────────

interface OdDiseaseSummary {
  ORPHAcode: number
  'Preferred term': string
}

interface OdDiseaseDetail {
  ORPHAcode: number
  'Preferred term': string
  Synonym?: string[]
  ExternalReference?: Array<{ Source: string; Reference: string }>
}

interface OdHPO {
  Disorder?: {
    HPODisorderAssociation?: Array<{
      HPO:          { HPOId: string; HPOTerm: string }
      HPOFrequency?: string
    }>
  }
}

interface OdGenes {
  DisorderGeneAssociation?: Array<{
    Gene: {
      Symbol: string
      Name?:  string
      Locus?: Array<{ GeneLocus: string }>
      ExternalReference?: Array<{ Source: string; Reference: string }>
    }
    DisorderGeneAssociationType?: string
  }>
}

interface OdNaturalHistory {
  AverageAgeOfOnset?: string[]
  TypeOfInheritance?: string[]
}

interface OdEpidemiology {
  Prevalence?: Array<{
    PrevalenceType?:          string
    PrevalenceClass?:         string
    PrevalenceGeographic?:    string
    PrevalenceQualification?: string
    ValMoy?:                  string
  }>
}

// ─── Payload REST API ─────────────────────────────────────────────────────────

let authToken: string | null = null
let tokenRefreshedAt = 0

async function payloadLogin(): Promise<boolean> {
  const email    = process.env.PAYLOAD_ADMIN_EMAIL
  const password = process.env.PAYLOAD_ADMIN_PASSWORD
  if (!email || !password) {
    console.error('❌ PAYLOAD_ADMIN_EMAIL und PAYLOAD_ADMIN_PASSWORD müssen in .env.local gesetzt sein.')
    return false
  }
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json() as { token?: string; errors?: unknown[] }
    if (!res.ok || !data.token) {
      console.error(`❌ Payload Login fehlgeschlagen (${res.status}):`, data)
      return false
    }
    authToken = data.token
    tokenRefreshedAt = Date.now()
    console.log('✓ Payload Login erfolgreich')
    return true
  } catch (err) {
    console.error(`❌ Payload Login Verbindungsfehler: ${err}`)
    console.error(`  Läuft der Dev-Server auf ${PAYLOAD_URL}?`)
    return false
  }
}

// Token nach 90 Minuten automatisch erneuern
async function ensureFreshToken(): Promise<void> {
  if (Date.now() - tokenRefreshedAt > 90 * 60 * 1000) {
    console.log('  🔄 Token erneuern...')
    await payloadLogin()
  }
}

function fetchWithTimeout(url: string, opts: RequestInit, ms = 15_000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

async function payloadFind(
  collection: string,
  field: string,
  value: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    [`where[${field}][equals]`]: value,
    limit: '1',
    depth:  '0',
  })
  try {
    const res = await fetchWithTimeout(`${PAYLOAD_URL}/api/${collection}?${params}`, {
      headers: { Authorization: `JWT ${authToken}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { docs?: Array<{ id: string }> }
    return data.docs?.[0]?.id ?? null
  } catch {
    return null
  }
}

async function payloadCreate(
  collection: string,
  body: Record<string, unknown>,
): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`${PAYLOAD_URL}/api/${collection}`, {
      method:  'POST',
      headers: {
        Authorization:  `JWT ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }, 20_000)
    if (!res.ok) {
      const text = await res.text()
      console.error(`  ❌ POST /${collection}: ${res.status} ${text.slice(0, 300)}`)
      return null
    }
    const result = await res.json() as { doc?: { id: string }; id?: string }
    return (result.doc?.id ?? result.id ?? null) as string | null
  } catch (err) {
    console.error(`  ❌ POST /${collection} timeout/error: ${err}`)
    return null
  }
}

// ─── Orphadata-Hilfsfunktionen ────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function od<T>(path: string): Promise<T | null> {
  await sleep(API_DELAY_MS)
  try {
    const res = await fetch(`${ORPHADATA}${path}`, {
      headers: {
        Accept:       'application/json',
        'User-Agent': 'WohinMedizin.at/1.0',
      },
    })
    if (res.status === 429) {
      console.warn('  Rate-limit, warte 15s...')
      await sleep(15_000)
      return od<T>(path)
    }
    if (res.status === 404) return null
    if (!res.ok) { console.warn(`  HTTP ${res.status}: ${path}`); return null }
    const json = await res.json() as { data?: { results?: T } } | T
    if (typeof json === 'object' && json !== null && 'data' in json) {
      return (json as { data?: { results?: T } }).data?.results ?? null
    }
    return json as T
  } catch (err) {
    console.warn(`  Fehler ${path}: ${err}`)
    return null
  }
}

async function odPages<T>(path: string): Promise<T[]> {
  const all: T[] = []
  let page = 1
  while (true) {
    await sleep(API_DELAY_MS)
    try {
      const res = await fetch(
        `${ORPHADATA}${path}?page=${page}&items_per_page=100`,
        { headers: { Accept: 'application/json', 'User-Agent': 'WohinMedizin.at/1.0' } },
      )
      if (!res.ok) break
      const json = await res.json() as { data?: { results?: T[]; __count?: number } }
      const items = json.data?.results
      if (!Array.isArray(items) || items.length === 0) break
      all.push(...items)
      const total = json.data?.__count ?? 0
      if (total > 0 && all.length >= total) break
      if (items.length < 100) break
      page++
    } catch {
      break
    }
  }
  return all
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapInheritance(name: string): string {
  const map: Record<string, string> = {
    'Autosomal dominant':         'autosomal_dominant',
    'Autosomal recessive':        'autosomal_recessive',
    'X-linked dominant':          'x_dominant',
    'X-linked recessive':         'x_recessive',
    'Mitochondrial':              'mitochondrial',
    'Multigenic/multifactorial':  'multifactorial',
    'De novo':                    'de_novo',
    'Not applicable':             'non_genetic',
  }
  return map[name] ?? 'unknown'
}

function mapAgeOfOnset(names: string[]): string[] {
  const map: Record<string, string> = {
    'Antenatal':             'congenital',
    'Neonatal':              'neonatal',
    'Infancy':               'infancy',
    'Childhood':             'childhood',
    'Adolescence':           'adolescence',
    'Adult':                 'young_adult',
    'Elderly':               'elderly',
    'All ages':              'all_ages',
    'No data available':     'all_ages',
  }
  const result = names.map((n) => map[n] ?? 'all_ages')
  return [...new Set(result)]
}

function mapHPOFrequency(freq: string): string {
  if (/obligate|100%/i.test(freq))        return 'very_common'
  if (/very frequent|80-99/i.test(freq))  return 'very_common'
  if (/frequent|30-79/i.test(freq))       return 'common'
  if (/occasional|5-29/i.test(freq))      return 'occasional'
  if (/very rare|1-4/i.test(freq))        return 'rare'
  if (/excluded/i.test(freq))             return 'rare'
  return 'occasional'
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

function matchesCluster(name: string): boolean {
  if (!CLUSTER || !CLUSTER_KEYWORDS[CLUSTER]) return true
  const lower = name.toLowerCase()
  return CLUSTER_KEYWORDS[CLUSTER].some((kw) => lower.includes(kw))
}

// ─── Import ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('═'.repeat(60))
  console.log('WohinMedizin — Orphadata Import')
  console.log(`Modus:   ${DRY_RUN ? 'DRY-RUN (nichts gespeichert)' : 'LIVE'}`)
  console.log(`Limit:   ${LIMIT === Infinity ? 'unbegrenzt' : LIMIT}`)
  console.log(`Cluster: ${CLUSTER ?? 'alle'}`)
  console.log(`Server:  ${PAYLOAD_URL}`)
  console.log('═'.repeat(60))

  if (!DRY_RUN) {
    const ok = await payloadLogin()
    if (!ok) process.exit(1)
  }

  // Phase 0: Orphadata-Source-Dokument
  let orphadataSourceId: string | null = null
  if (!DRY_RUN) {
    orphadataSourceId = await payloadFind('sources', 'sourceType', 'orphadata')
    if (orphadataSourceId) {
      console.log(`↺ Orphadata-Source vorhanden: ${orphadataSourceId}`)
    } else {
      orphadataSourceId = await payloadCreate('sources', {
        title:               'Orphadata — Rare Diseases Data',
        url:                 'https://api.orphadata.com',
        sourceType:          'orphadata',
        license:             'cc_by_4',
        authorOrOrganization:'Inserm US14 — Orphanet',
        accessedAt:          new Date().toISOString(),
        notes:               'CC BY 4.0. Attribution: "Data provided by Orphanet (INSERM US14), www.orphadata.com".',
      })
      console.log(`✓ Source angelegt: ${orphadataSourceId}`)
    }
  }

  // Phase 1: Erkrankungsliste
  console.log('\n📥 Phase 1 — Lade Erkrankungsliste...')
  let allDiseases = await odPages<OdDiseaseSummary>('/rd-cross-referencing/orphacodes')
  console.log(`  ${allDiseases.length} Einträge von Orphadata`)

  if (allDiseases.length === 0) {
    console.error('Keine Daten von Orphadata. API nicht erreichbar?')
    console.error('Prüfe: https://api.orphadata.com/rd-cross-referencing/orphacodes')
    process.exit(1)
  }

  // Cluster-Filter und Limit
  if (CLUSTER) {
    allDiseases = allDiseases.filter((d) => matchesCluster(d['Preferred term']))
    console.log(`  → ${allDiseases.length} nach Cluster-Filter "${CLUSTER}"`)
  }
  if (LIMIT !== Infinity) allDiseases = allDiseases.slice(0, LIMIT)
  console.log(`  → ${allDiseases.length} zu importieren`)

  // Phase 2: HPO-Terme (Symptoms)
  console.log('\n📥 Phase 2 — Lade HPO-Terme...')
  const hpoToId  = new Map<string, string>()
  const allHpo   = new Map<string, { id: string; label: string; frequency: string }>()
  const sample   = Math.min(allDiseases.length, DRY_RUN ? 5 : 100)

  for (let i = 0; i < sample; i++) {
    const code = allDiseases[i].ORPHAcode
    const data = await od<OdHPO>(`/rd-phenotypes/orphacodes/${code}`)
    if (!data) continue
    for (const assoc of data.Disorder?.HPODisorderAssociation ?? []) {
      const { HPOId, HPOTerm } = assoc.HPO
      if (!HPOId || allHpo.has(HPOId)) continue
      allHpo.set(HPOId, { id: HPOId, label: HPOTerm, frequency: mapHPOFrequency(assoc.HPOFrequency ?? '') })
    }
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${sample} HPO abgefragt...`)
  }
  console.log(`  ${allHpo.size} HPO-Terme gefunden`)

  if (!DRY_RUN) {
    let created = 0; let reused = 0
    for (const [hpoId, t] of allHpo) {
      const existing = await payloadFind('symptoms', 'hpoCode', hpoId)
      if (existing) { hpoToId.set(hpoId, existing); reused++; continue }
      const slug = `${slugify(t.label)}-${hpoId.replace('HP:', '').slice(0, 7)}`
      const id   = await payloadCreate('symptoms', {
        name:        t.label,
        slug,
        hpoCode:     t.id,
        category:    t.frequency,
        description: `HPO-Term ${t.id}`,
      })
      if (id) { hpoToId.set(hpoId, id); created++ }
    }
    console.log(`  ✓ ${created} neu, ${reused} wiederverwendet`)
  } else {
    console.log(`  [DRY-RUN] Würde ${allHpo.size} Symptoms anlegen`)
    for (const [k] of allHpo) hpoToId.set(k, `dry-${k}`)
  }

  // Phase 3: Gene
  console.log('\n📥 Phase 3 — Lade Gen-Assoziationen...')
  const geneToId = new Map<string, string>()
  const allGenes = new Map<string, { symbol: string; name: string; omim?: string; locus?: string }>()

  for (let i = 0; i < sample; i++) {
    const code = allDiseases[i].ORPHAcode
    const data = await od<OdGenes>(`/rd-associated-genes/orphacodes/${code}`)
    if (!data) continue
    for (const entry of data.DisorderGeneAssociation ?? []) {
      const { Symbol, ExternalReference, Locus } = entry.Gene
      if (!Symbol || allGenes.has(Symbol)) continue
      const omimRef = ExternalReference?.find((r) => r.Source === 'OMIM')
      allGenes.set(Symbol, {
        symbol: Symbol,
        name:   entry.Gene.Name ?? Symbol,
        omim:   omimRef?.Reference,
        locus:  Locus?.[0]?.GeneLocus,
      })
    }
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${sample} Gene abgefragt...`)
  }
  console.log(`  ${allGenes.size} Gene gefunden`)

  if (!DRY_RUN) {
    let created = 0; let reused = 0
    for (const [symbol, g] of allGenes) {
      const existing = await payloadFind('genes', 'symbol', symbol)
      if (existing) { geneToId.set(symbol, existing); reused++; continue }
      const id = await payloadCreate('genes', {
        symbol:            g.symbol,
        fullName:          g.name,
        omimId:            g.omim,
        chromosome:        g.locus,
        inheritancePattern:'unknown',
      })
      if (id) { geneToId.set(symbol, id); created++ }
    }
    console.log(`  ✓ ${created} neu, ${reused} wiederverwendet`)
  } else {
    console.log(`  [DRY-RUN] Würde ${allGenes.size} Gene anlegen`)
    for (const [k] of allGenes) geneToId.set(k, `dry-${k}`)
  }

  // Phase 4: Diseases
  console.log('\n📥 Phase 4 — Importiere Krankheitsprofile...')
  let docCreated = 0; let docSkipped = 0; let docErrors = 0

  for (const summary of allDiseases) {
    const code = summary.ORPHAcode
    const name = summary['Preferred term']

    try {
      if (!DRY_RUN) {
        await ensureFreshToken()
        const existing = await payloadFind('diseases', 'codes.orphaCode', `ORPHA:${code}`)
        if (existing) { docSkipped++; continue }
      }

      // Alle Detail-Anfragen parallel
      const [detail, hpoData, geneData, epidData, natHist] = await Promise.all([
        od<OdDiseaseDetail>(`/rd-cross-referencing/orphacodes/${code}`),
        od<OdHPO>(`/rd-phenotypes/orphacodes/${code}`),
        od<OdGenes>(`/rd-associated-genes/orphacodes/${code}`),
        od<OdEpidemiology>(`/rd-epidemiology/orphacodes/${code}`),
        od<OdNaturalHistory>(`/rd-natural_history/orphacodes/${code}`),
      ])

      // HPO-Symptom-IDs
      const symptomIds: string[] = []
      const hpoTermsDoc: Array<{ hpoId: string; hpoLabel: string }> = []
      for (const assoc of hpoData?.Disorder?.HPODisorderAssociation ?? []) {
        const hpoId = assoc.HPO?.HPOId
        if (!hpoId) continue
        const pid = hpoToId.get(hpoId)
        if (pid && !symptomIds.includes(pid)) symptomIds.push(pid)
        hpoTermsDoc.push({ hpoId, hpoLabel: assoc.HPO?.HPOTerm ?? '' })
      }

      // Gen-IDs
      const geneIds: string[] = []
      for (const entry of geneData?.DisorderGeneAssociation ?? []) {
        const sym = entry.Gene?.Symbol
        if (!sym) continue
        const pid = geneToId.get(sym)
        if (pid && !geneIds.includes(pid)) geneIds.push(pid)
      }

      // Vererbung
      const inheritance = [...new Set((natHist?.TypeOfInheritance ?? []).map(mapInheritance))]

      // Prävalenz
      const prevEntry  = epidData?.Prevalence?.find((p) => p.PrevalenceType === 'Point prevalence')
      const prevalence = prevEntry
        ? `${prevEntry.PrevalenceClass ?? ''} (${prevEntry.PrevalenceGeographic ?? 'Europe'})`
        : undefined

      // Externe Referenzen
      const refs   = detail?.ExternalReference ?? []
      const icd10  = refs.find((r) => r.Source === 'ICD-10')?.Reference
      const omim   = refs.find((r) => r.Source === 'OMIM')?.Reference
      const aliases = (detail?.Synonym ?? []).map((s) => ({ alias: s, language: 'en' as const }))

      if (DRY_RUN) {
        console.log(`  [DRY-RUN] ${name} (ORPHA:${code}) | Sym: ${symptomIds.length} | Gen: ${geneIds.length} | ICD-10: ${icd10 ?? '—'} | Alias: ${aliases.length}`)
        docCreated++
        continue
      }

      const id = await payloadCreate('diseases', {
        name,
        slug:            `${slugify(name)}-orpha-${code}`,
        aliases,
        primaryEtiology: 'unknown',
        organSystems:    ['multisystemic'],
        modifiers: {
          courseModifier:      'chronic',
          severitySpectrum:    [],
          riskFactorCategories:[],
          diagnosticModalities: geneIds.length > 0 ? ['clinical', 'genetics'] : ['clinical'],
        },
        codes: {
          orphaCode:         `ORPHA:${code}`,
          icd10Code:         icd10,
          omimCode:          omim,
          hpoTerms:          hpoTermsDoc.slice(0, 50),
          icd11ChapterAnchor:'',
        },
        epidemiology: {
          prevalence,
          ageOfOnset: mapAgeOfOnset(natHist?.AverageAgeOfOnset ?? []),
          inheritance: inheritance.length > 0 ? inheritance : ['unknown'],
        },
        symptomsRelationship: symptomIds,
        genesRelationship:    geneIds,
        briefDescription:     `${name} (ORPHA:${code}) ist eine seltene Erkrankung. Basisdaten aus Orphanet (INSERM US14). Redaktionelle Aufbereitung ausstehend.`,
        disclaimer:           'Diese Informationen dienen der allgemeinen Orientierung und ersetzen keine ärztliche Beratung, Diagnose oder Behandlung.',
        sources:              orphadataSourceId ? [orphadataSourceId] : [],
        status:               'draft',
      })

      if (id) {
        docCreated++
        if (docCreated % 10 === 0)
          console.log(`  ✓ ${docCreated} importiert, ${docSkipped} übersprungen, ${docErrors} Fehler`)
      } else {
        docErrors++
      }

    } catch (err) {
      docErrors++
      console.error(`  ✗ ORPHA:${code} (${name}): ${err}`)
    }
  }

  // Zusammenfassung
  console.log('\n' + '═'.repeat(60))
  console.log('Import abgeschlossen')
  console.log(`  Erkrankungen: ${docCreated} importiert, ${docSkipped} übersprungen, ${docErrors} Fehler`)
  console.log(`  Symptoms:     ${hpoToId.size} verarbeitet`)
  console.log(`  Gene:         ${geneToId.size} verarbeitet`)
  if (DRY_RUN) console.log('\n  DRY-RUN: Nichts gespeichert. Zum Import: npm run orpha:import:pilot')
  console.log('═'.repeat(60))
  process.exit(0)
}

main().catch((err) => {
  console.error('Unerwarteter Fehler:', err)
  process.exit(1)
})
