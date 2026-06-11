/**
 * WohinMedizin — Patientenorganisationen Seed
 *
 * Legt österreichische und europäische Patientenorganisationen für
 * seltene Erkrankungen an.
 *
 * Quellen:
 *   - Pro Rare Austria Mitglieder (https://www.prorare-austria.org/mitglieder)
 *   - EURORDIS-Mitglieder Österreich (https://www.eurordis.org/members)
 *   - Orphanet Österreich
 *
 * Ausführen:
 *   PAYLOAD_ADMIN_EMAIL=... PAYLOAD_ADMIN_PASSWORD=... npx tsx scripts/editorial/patient-orgs-seed.ts
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(process.cwd(), '.env.local') })

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3003'
const DRY = process.argv.includes('--dry-run')

function requireEnv(k: string) {
  const v = process.env[k]
  if (!v) { console.error(`❌ ${k} fehlt`); process.exit(1) }
  return v
}

async function getToken(email: string, pass: string) {
  const r = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  })
  if (!r.ok) throw new Error(`Login HTTP ${r.status}`)
  return ((await r.json()) as { token: string }).token
}

async function upsert(token: string, slug: string, data: Record<string, unknown>) {
  if (DRY) { console.log(`  [DRY] ${data.name}`); return }
  const search = await fetch(`${PAYLOAD_URL}/api/patient-organizations?where[slug][equals]=${slug}&limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const { docs } = await search.json() as { docs: Array<{ id: string }> }
  if (docs[0]) {
    await fetch(`${PAYLOAD_URL}/api/patient-organizations/${docs[0].id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(data),
    })
    console.log(`  ✅ Aktualisiert: ${data.name}`)
  } else {
    const r = await fetch(`${PAYLOAD_URL}/api/patient-organizations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({ ...data, slug }),
    })
    if (!r.ok) { const e = await r.text(); throw new Error(`POST ${r.status}: ${e.slice(0,150)}`) }
    console.log(`  ✅ Neu: ${data.name}`)
  }
}

// ─── Organisationen ───────────────────────────────────────────────────────────

const ORGS = [

  // ── Österreich — Dachverbände ─────────────────────────────────────────────────

  {
    slug: 'pro-rare-austria',
    name: 'Pro Rare Austria',
    country: 'at',
    website: 'https://www.prorare-austria.org',
    email: 'office@prorare-austria.org',
    phone: '+43 1 718 34 50',
    description: 'Dachverband der österreichischen Patientenorganisationen für seltene Erkrankungen. EURORDIS-Mitglied. Vertritt Betroffene gegenüber Gesundheitspolitik und -system.',
    organSystems: ['multisystemic'],
    scope: 'national',
    eurordisId: null,
  },

  // ── Österreich — Krankheitsspezifisch ─────────────────────────────────────────

  {
    slug: 'muko-at',
    name: 'Mukoviszidose Österreich',
    country: 'at',
    website: 'https://www.muko.at',
    email: 'office@muko.at',
    description: 'Selbsthilfe und Interessenvertretung für Menschen mit Zystischer Fibrose (Mukoviszidose) in Österreich. Beratung, Vernetzung, Forschungsförderung.',
    organSystems: ['respiratory', 'gastrointestinal'],
    scope: 'national',
    orphaCodes: ['586'],
  },

  {
    slug: 'pku-austria',
    name: 'PKU Austria',
    country: 'at',
    website: 'https://www.pku.at',
    description: 'Österreichische Selbsthilfegruppe für Phenylketonurie (PKU) und andere Aminosäurestoffwechselstörungen. Beratung, Rezepte für phenylalaninfreie Ernährung, Vernetzung.',
    organSystems: ['endocrine_metabolic', 'neurological'],
    scope: 'national',
    orphaCodes: ['716'],
  },

  {
    slug: 'lupus-austria',
    name: 'Lupus Austria',
    country: 'at',
    website: 'https://www.lupus-austria.at',
    description: 'Selbsthilfe für Menschen mit Systemischem Lupus Erythematodes (SLE) und verwandten Erkrankungen in Österreich. Regionale Gruppen, Beratung, Aufklärungsarbeit.',
    organSystems: ['hematological_immunological', 'dermatological'],
    scope: 'national',
    orphaCodes: ['536'],
  },

  {
    slug: 'oesterreich-marfan',
    name: 'Marfan Syndrom Österreich',
    country: 'at',
    website: 'https://www.marfan.at',
    description: 'Patientenorganisation für Menschen mit Marfan-Syndrom und verwandten HTAD-Erkrankungen in Österreich. Vernetzung mit der deutschen Marfan Hilfe.',
    organSystems: ['cardiovascular', 'musculoskeletal'],
    scope: 'national',
    orphaCodes: ['558'],
  },

  {
    slug: 'oesterreich-ms-gesellschaft',
    name: 'Multiple Sklerose Gesellschaft Österreich (ÖMSG)',
    country: 'at',
    website: 'https://www.ms-gesellschaft.at',
    email: 'office@ms-gesellschaft.at',
    phone: '+43 1 524 25 00',
    description: 'Größte österreichische Organisation für MS-Betroffene. Beratung, Selbsthilfegruppen, politische Interessenvertretung und Forschungsförderung.',
    organSystems: ['neurological'],
    scope: 'national',
  },

  {
    slug: 'oepwg-parkinson',
    name: 'Österreichische Parkinson Gesellschaft (ÖPG)',
    country: 'at',
    website: 'https://www.parkinson-oesterreich.at',
    description: 'Selbsthilfe und Fachgesellschaft für Parkinson-Erkrankte in Österreich. Auch zuständig für seltene Parkinsonismus-Syndrome (PSP, MSA, CBD).',
    organSystems: ['neurological'],
    scope: 'national',
  },

  {
    slug: 'morbus-fabry-austria',
    name: 'Fabry Österreich',
    country: 'at',
    website: 'https://www.fabry.at',
    description: 'Selbsthilfegruppe für Menschen mit Morbus Fabry (Lysosomale Speicherkrankheit) in Österreich.',
    organSystems: ['endocrine_metabolic', 'cardiovascular', 'urogenital'],
    scope: 'national',
    orphaCodes: ['324'],
  },

  {
    slug: 'selbsthilfe-oesterreich',
    name: 'Selbsthilfe Österreich',
    country: 'at',
    website: 'https://www.selbsthilfe-oesterreich.at',
    email: 'office@selbsthilfe-oesterreich.at',
    phone: '+43 1 892 12 43',
    description: 'Dachverband der Selbsthilfegruppen in Österreich. Bietet für seltene Erkrankungen ohne eigene Organisation eine Anlaufstelle und Vernetzungshilfe.',
    organSystems: ['multisystemic'],
    scope: 'national',
  },

  {
    slug: 'bags-oesterreich',
    name: 'BAGS — Bundesarbeitsgemeinschaft Selbsthilfe Österreich',
    country: 'at',
    website: 'https://www.bags-oesterreich.at',
    description: 'Dachverband für Selbsthilfegruppen chronisch kranker und behinderter Menschen in Österreich. Anlaufstelle für seltene Erkrankungen ohne spezifische Organisation.',
    organSystems: ['multisystemic'],
    scope: 'national',
  },

  // ── Europa / International ─────────────────────────────────────────────────────

  {
    slug: 'eurordis',
    name: 'EURORDIS — Rare Diseases Europe',
    country: 'eu',
    website: 'https://www.eurordis.org',
    email: 'eurordis@eurordis.org',
    description: 'Europäische Dachorganisation für seltene Erkrankungen. Vertritt über 1.000 Mitgliedsorganisationen aus 74 Ländern. Betreibt RareConnect (Patientengemeinschaften) und das EURORDIS-Patientenregister.',
    organSystems: ['multisystemic'],
    scope: 'european',
  },

  {
    slug: 'rareconnect',
    name: 'RareConnect',
    country: 'eu',
    website: 'https://www.rareconnect.org',
    description: 'Internationale Online-Community-Plattform von EURORDIS für Menschen mit seltenen Erkrankungen. Vernetzt Betroffene weltweit, auf Deutsch und in vielen anderen Sprachen verfügbar.',
    organSystems: ['multisystemic'],
    scope: 'global',
  },

  {
    slug: 'nord-usa',
    name: 'NORD — National Organization for Rare Disorders (USA)',
    country: 'intl',
    website: 'https://rarediseases.org',
    description: 'Größte US-amerikanische Patientenorganisation für seltene Erkrankungen. Umfangreiche englischsprachige Krankheitsdatenbank (NORD Rare Disease Database) frei zugänglich.',
    organSystems: ['multisystemic'],
    scope: 'global',
  },

  {
    slug: 'duchenne-deutschland',
    name: 'Duchenne Deutschland e.V.',
    country: 'de',
    website: 'https://www.duchenne-deutschland.de',
    description: 'Größte deutschsprachige Patientenorganisation für Duchenne- und Becker-Muskeldystrophie. Auch für österreichische Familien erste Anlaufstelle.',
    organSystems: ['neurological', 'musculoskeletal'],
    scope: 'dach',
    orphaCodes: ['98896', '98895'],
  },

  {
    slug: 'deutsche-marfan-hilfe',
    name: 'Deutsche Marfan Hilfe e.V.',
    country: 'de',
    website: 'https://www.marfan.de',
    description: 'Größte deutschsprachige Patientenorganisation für Marfan-Syndrom und verwandte Erkrankungen. Österreichische Mitglieder willkommen.',
    organSystems: ['cardiovascular', 'musculoskeletal', 'visual'],
    scope: 'dach',
    orphaCodes: ['558'],
  },

  {
    slug: 'garcd-gaucher',
    name: 'Gaucher Austria',
    country: 'at',
    website: 'https://www.gaucher-austria.at',
    description: 'Österreichische Selbsthilfe für Menschen mit Morbus Gaucher (lysosomale Speicherkrankheit).',
    organSystems: ['endocrine_metabolic', 'hematological_immunological'],
    scope: 'national',
    orphaCodes: ['355'],
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏥 Patientenorganisationen-Seed')
  console.log(`   Modus: ${DRY ? 'DRY-RUN' : 'LIVE'}`)
  console.log(`   ${ORGS.length} Organisationen\n`)

  const email = requireEnv('PAYLOAD_ADMIN_EMAIL')
  const pass  = requireEnv('PAYLOAD_ADMIN_PASSWORD')
  const token = await getToken(email, pass)
  console.log('✅ Eingeloggt\n')

  let ok = 0, err = 0
  for (const { slug, ...data } of ORGS) {
    try {
      await upsert(token, slug, data)
      ok++
    } catch (e) {
      console.error(`  ❌ ${(e as Error).message.slice(0,150)}`)
      err++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n──────────────────────────────`)
  console.log(`✅ ${ok} OK, ${err} Fehler`)
}

main().catch(e => { console.error('💥', e); process.exit(1) })
