/**
 * WohinMedizin — Österreichische Expertenzentren Seed
 *
 * Legt alle bekannten österreichischen Referenzzentren für seltene Erkrankungen
 * an (European Reference Networks, Pro Rare Austria, ÖNSE-Mitglieder).
 *
 * Quellen:
 *   - ERN Austria (https://ec.europa.eu/health/ern/networks_en)
 *   - Pro Rare Austria (https://www.prorare-austria.org/mitglieder)
 *   - Orphanet Austria (https://www.orpha.net)
 *
 * Ausführen:
 *   PAYLOAD_ADMIN_EMAIL=... PAYLOAD_ADMIN_PASSWORD=... npx tsx scripts/editorial/expert-centers-seed.ts
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
  const search = await fetch(`${PAYLOAD_URL}/api/expert-centers?where[slug][equals]=${slug}&limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const { docs } = await search.json() as { docs: Array<{ id: string }> }
  if (docs[0]) {
    await fetch(`${PAYLOAD_URL}/api/expert-centers/${docs[0].id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(data),
    })
    console.log(`  ✅ Aktualisiert: ${data.name}`)
  } else {
    const r = await fetch(`${PAYLOAD_URL}/api/expert-centers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({ ...data, slug }),
    })
    if (!r.ok) { const e = await r.text(); throw new Error(`POST ${r.status}: ${e.slice(0,150)}`) }
    console.log(`  ✅ Neu: ${data.name}`)
  }
}

// ─── Zentren ──────────────────────────────────────────────────────────────────

const CENTERS = [

  // ── Wien ─────────────────────────────────────────────────────────────────────

  {
    slug: 'meduni-wien-seltene-erkrankungen',
    name: 'Kompetenzzentrum für Seltene Erkrankungen — MedUni Wien / AKH Wien',
    institution: 'Medizinische Universität Wien / AKH Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.meduniwien.ac.at/web/seltene-erkrankungen',
    phone: '+43 1 40400 0',
    email: 'seltene.erkrankungen@meduniwien.ac.at',
    organSystems: ['multisystemic'],
    ernMembership: ['ERN-RND', 'ERN-EURO-NMD', 'ERN-ERICA', 'ERN-SKIN', 'ERN-EYE', 'VASCERN', 'ERN-GENTURIS'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Zentrales Kompetenzzentrum der MedUni Wien für Patienten mit seltenen Erkrankungen. Koordiniert die ERN-Teilnahme und vernetzt spezialisierte Ambulanzen aller Kliniken des AKH Wien.',
    status: 'active',
  },

  {
    slug: 'akh-wien-neurologie-seltene',
    name: 'Klinische Abteilung für Neurologie — AKH Wien (ERN-RND)',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/neurologie',
    phone: '+43 1 40400 31990',
    organSystems: ['neurological'],
    ernMembership: ['ERN-RND'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Spezialisiert auf seltene neurologische Erkrankungen. ERN-RND-Mitglied (Rare Neurological Diseases). Expertise in Bewegungsstörungen, neuromuskulären Erkrankungen, Leukodystrophien.',
    status: 'active',
  },

  {
    slug: 'akh-wien-haematologie-seltene',
    name: 'Klin. Abteilung für Hämatologie & Hämostaseologie — AKH Wien',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/innere-medizin-i/haematologie',
    phone: '+43 1 40400 44080',
    organSystems: ['hematological_immunological'],
    ernMembership: ['ERN-EuroBloodNet'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Referenzzentrum für seltene Bluterkrankungen (Hämophilie, MDS, PNH, aplastische Anämien). ERN-EuroBloodNet-Mitglied.',
    status: 'active',
  },

  {
    slug: 'akh-wien-kardiologie-seltene',
    name: 'Klin. Abteilung für Kardiologie — AKH Wien (VASCERN)',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/innere-medizin-ii/kardiologie',
    phone: '+43 1 40400 46140',
    organSystems: ['cardiovascular'],
    ernMembership: ['VASCERN'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Expertise in seltenen kardiovaskulären Erkrankungen (Marfan, HTAD, Kardiomyopathien). VASCERN-Mitglied (Vascular Rare Diseases).',
    status: 'active',
  },

  {
    slug: 'akh-wien-kinderheilkunde-seltene',
    name: 'Universitätsklinik für Kinder- und Jugendheilkunde — AKH Wien (ENDO-ERN)',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/kinder-jugendheilkunde',
    phone: '+43 1 40400 32230',
    organSystems: ['endocrine_metabolic', 'neurological'],
    ernMembership: ['ENDO-ERN', 'MetabERN'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Pädiatrisches Referenzzentrum für seltene Stoffwechselerkrankungen, seltene endokrine Erkrankungen und kindliche seltene neurologische Erkrankungen.',
    status: 'active',
  },

  {
    slug: 'akh-wien-dermatologie-seltene',
    name: 'Universitätsklinik für Dermatologie — AKH Wien (ERN-SKIN)',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/dermatologie',
    phone: '+43 1 40400 77010',
    organSystems: ['dermatological'],
    ernMembership: ['ERN-SKIN'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'ERN-SKIN-Mitglied. Spezialisiert auf seltene Hauterkrankungen (Epidermolysis bullosa, Ichthyosen, seltene Bindegewebserkrankungen mit Hautbeteiligung).',
    status: 'active',
  },

  {
    slug: 'akh-wien-rheumatologie-seltene',
    name: 'Klinische Abteilung für Rheumatologie — AKH Wien',
    institution: 'AKH Wien / MedUni Wien',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'Währinger Gürtel 18–20, 1090 Wien',
    website: 'https://www.akh.wien.at/medizin/kliniken/innere-medizin-iii/rheumatologie',
    phone: '+43 1 40400 43060',
    organSystems: ['hematological_immunological', 'musculoskeletal'],
    ernMembership: ['ERN-ReCONNET'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Referenzzentrum für seltene rheumatologische Erkrankungen (Systemischer Lupus, systemische Sklerose, CAPS, seltene Vaskulitiden). ERN-ReCONNET-Mitglied.',
    status: 'active',
  },

  // ── Innsbruck ─────────────────────────────────────────────────────────────────

  {
    slug: 'meduni-innsbruck-seltene-erkrankungen',
    name: 'Seltene Erkrankungen Tirol — MedUni Innsbruck',
    institution: 'Medizinische Universität Innsbruck',
    city: 'Innsbruck', country: 'at', postalCode: '6020',
    address: 'Anichstraße 35, 6020 Innsbruck',
    website: 'https://www.i-med.ac.at/kliniken-zentren/seltene-erkrankungen',
    phone: '+43 512 504 0',
    organSystems: ['multisystemic'],
    ernMembership: ['ERN-RND', 'MetabERN', 'ERN-EURO-NMD'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Koordinationszentrum für seltene Erkrankungen der MedUni Innsbruck. Besondere Expertise in seltenen Neurologie-, Metabolismus- und neuromuskulären Erkrankungen.',
    status: 'active',
  },

  {
    slug: 'innsbruck-neurologie-seltene',
    name: 'Universitätsklinik für Neurologie — Innsbruck (ERN-RND)',
    institution: 'Medizinische Universität Innsbruck',
    city: 'Innsbruck', country: 'at', postalCode: '6020',
    address: 'Anichstraße 35, 6020 Innsbruck',
    website: 'https://www.neurologie.tirol-kliniken.at',
    phone: '+43 512 504 24200',
    organSystems: ['neurological'],
    ernMembership: ['ERN-RND'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Spezialisiert auf seltene neurologische Erkrankungen, Prionenerkrankungen und neurodegenerative Seltenererkrankungen. ERN-RND-Mitglied.',
    status: 'active',
  },

  {
    slug: 'innsbruck-kinderheilkunde-stoffwechsel',
    name: 'Universitätsklinik für Pädiatrie — Metabolik Innsbruck (MetabERN)',
    institution: 'Medizinische Universität Innsbruck',
    city: 'Innsbruck', country: 'at', postalCode: '6020',
    address: 'Anichstraße 35, 6020 Innsbruck',
    website: 'https://www.kinderheilkunde.tirol-kliniken.at',
    phone: '+43 512 504 23600',
    organSystems: ['endocrine_metabolic', 'neurological'],
    ernMembership: ['MetabERN'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Pädiatrisches Referenzzentrum für seltene angeborene Stoffwechselstörungen (IEM), PKU, Glykogenspeicherkrankheiten, Lysosomspeicherkrankheiten. MetabERN-Mitglied.',
    status: 'active',
  },

  // ── Graz ──────────────────────────────────────────────────────────────────────

  {
    slug: 'meduni-graz-seltene-erkrankungen',
    name: 'Zentrum für Seltene Erkrankungen — MedUni Graz / LKH-Univ. Graz',
    institution: 'Medizinische Universität Graz / LKH-Universitätsklinikum Graz',
    city: 'Graz', country: 'at', postalCode: '8036',
    address: 'Auenbruggerplatz 2, 8036 Graz',
    website: 'https://www.uniklinikum-graz.at/seltene-erkrankungen',
    phone: '+43 316 385 0',
    organSystems: ['multisystemic'],
    ernMembership: ['ERN-RND', 'ERN-GENTURIS', 'ERN-EURO-NMD', 'MetabERN'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Koordinationsstelle für seltene Erkrankungen am Grazer Universitätsklinikum. Vernetzt Ambulanzen aller Fachrichtungen und bietet interdisziplinäre Fallkonferenzen.',
    status: 'active',
  },

  {
    slug: 'graz-humangenetik',
    name: 'Klinisches Institut für Humangenetik — Graz',
    institution: 'Medizinische Universität Graz',
    city: 'Graz', country: 'at', postalCode: '8036',
    address: 'Auenbruggerplatz 2, 8036 Graz',
    website: 'https://www.medunigraz.at/humangenetik',
    phone: '+43 316 385 72400',
    organSystems: ['multisystemic'],
    ernMembership: ['ERN-GENTURIS'],
    isERNMember: true,
    languages: ['de', 'en'],
    description: 'Diagnostik und Beratung bei seltenen genetischen Erkrankungen. ERN-GENTURIS-Mitglied (genetische Tumorsyndrome und Informationserkrankungen). Angebot: Exom-/Genomsequenzierung, pränatale Diagnostik.',
    status: 'active',
  },

  // ── Salzburg ──────────────────────────────────────────────────────────────────

  {
    slug: 'uniklinikum-salzburg-seltene',
    name: 'Paracelsus Medizinische Privatuniversität Salzburg — Seltene Erkrankungen',
    institution: 'Paracelsus Medizinische Privatuniversität / Uniklinikum Salzburg',
    city: 'Salzburg', country: 'at', postalCode: '5020',
    address: 'Müllner Hauptstraße 48, 5020 Salzburg',
    website: 'https://www.pmu.ac.at',
    phone: '+43 662 4482 0',
    organSystems: ['multisystemic', 'neurological', 'cardiovascular'],
    isERNMember: false,
    languages: ['de', 'en'],
    description: 'Spezialambulanz für seltene Erkrankungen an der PMU Salzburg. Regionale Anlaufstelle für Salzburg, Tirol und Oberösterreich.',
    status: 'active',
  },

  // ── Linz ──────────────────────────────────────────────────────────────────────

  {
    slug: 'kepler-uniklinikum-linz-seltene',
    name: 'Kepler Universitätsklinikum Linz — Seltene Erkrankungen',
    institution: 'Kepler Universitätsklinikum Linz',
    city: 'Linz', country: 'at', postalCode: '4020',
    address: 'Krankenhausstraße 9, 4020 Linz',
    website: 'https://www.kepleruniklinikum.at',
    phone: '+43 5 7680 80',
    organSystems: ['multisystemic', 'neurological', 'endocrine_metabolic'],
    isERNMember: false,
    languages: ['de'],
    description: 'Regionales Referenzzentrum für seltene Erkrankungen in Oberösterreich. Vernetzt mit Wiener ERN-Zentren über das österreichische SE-Netzwerk.',
    status: 'active',
  },

  // ── Nationale Koordination ────────────────────────────────────────────────────

  {
    slug: 'pro-rare-austria',
    name: 'Pro Rare Austria — Allianz für Seltene Erkrankungen',
    institution: 'Pro Rare Austria',
    city: 'Wien', country: 'at', postalCode: '1010',
    address: 'Schwarzenbergplatz 11, 1010 Wien',
    website: 'https://www.prorare-austria.org',
    phone: '+43 1 718 34 50',
    email: 'office@prorare-austria.org',
    organSystems: ['multisystemic'],
    isERNMember: false,
    languages: ['de', 'en'],
    description: 'Österreichische Patientenallianz für seltene Erkrankungen (Dachverband). Vertritt >30 Mitgliedsorganisationen, koordiniert nationale Seltene-Erkrankungen-Strategie und ist EURORDIS-Mitglied.',
    status: 'active',
  },

  {
    slug: 'onse-oesterreich',
    name: 'ÖNSE — Österreichisches Netzwerk Seltene Erkrankungen',
    institution: 'ÖNSE',
    city: 'Wien', country: 'at', postalCode: '1090',
    address: 'c/o MedUni Wien, Spitalgasse 23, 1090 Wien',
    website: 'https://www.meduniwien.ac.at/web/seltene-erkrankungen/oense',
    organSystems: ['multisystemic'],
    isERNMember: false,
    languages: ['de'],
    description: 'Nationales klinisches Netzwerk österreichischer Expertenzentren für seltene Erkrankungen. Vernetzt medizinische Fachkräfte, koordiniert den klinischen Austausch und die CPMS-Teilnahme.',
    status: 'active',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏥 Expertenzentren-Seed')
  console.log(`   Modus: ${DRY ? 'DRY-RUN' : 'LIVE'}`)
  console.log(`   ${CENTERS.length} Zentren\n`)

  const email = requireEnv('PAYLOAD_ADMIN_EMAIL')
  const pass  = requireEnv('PAYLOAD_ADMIN_PASSWORD')
  const token = await getToken(email, pass)
  console.log('✅ Eingeloggt\n')

  let ok = 0, err = 0
  for (const { slug, ...data } of CENTERS) {
    try {
      await upsert(token, slug, data)
      ok++
    } catch (e) {
      console.error(`  ❌ ${(e as Error).message.slice(0,120)}`)
      err++
    }
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n──────────────────────────────`)
  console.log(`✅ ${ok} OK, ${err} Fehler`)
}

main().catch(e => { console.error('💥', e); process.exit(1) })
