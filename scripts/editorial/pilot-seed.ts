/**
 * WohinMedizin — Pilot-Content Seed (5 Referenz-Krankheiten)
 *
 * Legt 5 vollständig redaktionell aufbereitete Krankheiten an bzw. aktualisiert
 * bestehende Einträge. Dient als Qualitätsstandard und Vorlagensammlung.
 *
 * Krankheiten:
 *   1. Duchenne-Muskeldystrophie (ORPHA:98896) — genetisch, neuromuskulär, Kinder
 *   2. Marfan-Syndrom (ORPHA:558) — genetisch, multisystemisch, Bindegewebe
 *   3. Phenylketonurie (ORPHA:716) — metabolisch, Neugeborenenscreening
 *   4. Systemischer Lupus Erythematodes (ORPHA:536) — autoimmun, multisystemisch
 *   5. Zystische Fibrose (ORPHA:586) — genetisch, Lunge/Verdauung
 *
 * Voraussetzungen:
 *   Dev-Server muss laufen: npm run dev
 *
 * Ausführen:
 *   npx tsx scripts/editorial/pilot-seed.ts --dry-run
 *   npx tsx scripts/editorial/pilot-seed.ts
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(process.cwd(), '.env.local') })

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3003'

// ─── Env-Validierung ─────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) { console.error(`❌  "${name}" fehlt in .env.local`); process.exit(1) }
  return val
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getToken(email: string, password: string): Promise<string> {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`Login fehlgeschlagen (HTTP ${res.status})`)
  const json = await res.json() as { token: string }
  return json.token
}

// ─── Lexical RichText Helper ──────────────────────────────────────────────────

function rt(text: string) {
  const paragraphs = text.split('\n').filter(l => l.trim())
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1,
      children: paragraphs.map(line => ({
        type: 'paragraph', format: '', indent: 0, version: 1,
        textFormat: 0, textStyle: '',
        children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: line, version: 1 }],
      })),
    },
  }
}

// ─── Payload Upsert ───────────────────────────────────────────────────────────

async function upsertDisease(token: string, slug: string, data: Record<string, unknown>): Promise<void> {
  if (DRY_RUN) { console.log(`  [DRY-RUN] upsert: ${slug}`); return }

  // Prüfen ob Eintrag bereits existiert
  const searchRes = await fetch(`${PAYLOAD_URL}/api/diseases?where[slug][equals]=${slug}&limit=1`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const searchJson = await searchRes.json() as { docs: Array<{ id: string }> }
  const existing = searchJson.docs[0]

  if (existing) {
    const res = await fetch(`${PAYLOAD_URL}/api/diseases/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`PATCH fehlgeschlagen: ${res.status}`)
    console.log(`  ✅ Aktualisiert (${existing.id})`)
  } else {
    const res = await fetch(`${PAYLOAD_URL}/api/diseases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({ ...data, slug }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`POST fehlgeschlagen: ${res.status} — ${err.slice(0, 200)}`)
    }
    const newDoc = await res.json() as { doc: { id: string } }
    console.log(`  ✅ Neu angelegt (${newDoc.doc?.id})`)
  }
}

// ─── Pilot-Daten ──────────────────────────────────────────────────────────────

const PILOT_DISEASES: Array<{ slug: string; data: Record<string, unknown> }> = [

  // ── 1. Duchenne-Muskeldystrophie ────────────────────────────────────────────
  {
    slug: 'duchenne-muskeldystrophie',
    data: {
      name: 'Duchenne-Muskeldystrophie',
      primaryEtiology: 'genetic',
      mechanismSubtype: 'monogenic',
      organSystems: ['neurological', 'cardiovascular', 'respiratory'],
      modifiers: { courseModifier: 'chronic', diagnosticModalities: ['clinical', 'laboratory', 'genetics'] },
      briefDescription: 'Duchenne-Muskeldystrophie (DMD) ist eine seltene genetische Erkrankung, bei der die Muskeln im Laufe der Zeit immer schwächer werden. Sie betrifft fast ausschließlich Jungen und wird durch einen Defekt im Dystrophin-Gen verursacht. Erste Zeichen zeigen sich meist zwischen dem 2. und 5. Lebensjahr — Kinder fallen häufiger hin, haben Schwierigkeiten beim Treppensteigen oder beim Aufstehen vom Boden. DMD ist derzeit nicht heilbar, aber moderne Therapien können den Krankheitsverlauf deutlich verlangsamen.',
      editorialTags: [
        { tag: 'Muskeln' },
        { tag: 'Kinder & Jugendliche' },
        { tag: 'Erblich' },
        { tag: 'Jungen' },
        { tag: 'Rollstuhl' },
        { tag: 'Selten' },
        { tag: 'Lunge & Herz betroffen' },
      ],
      doctorGuidance: {
        urgencyNote: 'soon',
        firstContact: rt('Wenn ein Kind zwischen 2 und 5 Jahren häufig stolpert, Schwierigkeiten beim Aufstehen vom Boden hat oder deutlich langsamer läuft als Gleichaltrige, ist der erste Schritt der Kinderarzt oder die Kinderärztin.\nSie veranlassen einen ersten Bluttest (Kreatinkinase, CK) — ein sehr erhöhter Wert ist ein starkes Hinweiszeichen auf DMD.\nDanach erfolgt eine Überweisung an ein spezialisiertes Zentrum für neuromuskuläre Erkrankungen.'),
        specialtiesNote: rt('Kinder-Neurologie: Stellt die Diagnose und koordiniert die gesamte Betreuung.\nKardiologie: Das Herz ist bei DMD fast immer mitbetroffen — regelmäßige Herzuntersuchungen sind Pflicht.\nPneumologie: Die Atemmuskulatur schwächt sich im Verlauf — Lungenfunktionskontrollen und ggf. Beatmungsunterstützung werden notwendig.\nPhysikalische Medizin & Rehabilitation: Physiotherapie und Hilfsmittelversorgung verbessern die Alltagsqualität erheblich.\nOrthopädie: Skoliose (Rückgradverkrümmung) ist eine häufige Folge und muss behandelt werden.'),
        diagnosticJourney: rt('Viele Familien berichten, dass zwischen den ersten Auffälligkeiten und der Diagnose DMD durchschnittlich 1–2 Jahre vergehen — oft weil die Symptome zunächst als normale Entwicklungsverzögerung gedeutet werden.\nDer erste Test ist eine CK-Blutuntersuchung (Kreatinkinase): Bei DMD ist dieser Wert oft mehr als 50-fach erhöht.\nDanach folgt eine Muskelbiopsie und/oder Genanalyse (Next-Generation-Sequencing), die den genauen Defekt im Dystrophin-Gen nachweist.\nIn Österreich wird DMD derzeit nicht im Neugeborenenscreening erfasst, Bestrebungen dazu laufen.'),
        redFlagSymptoms: rt('Sofort zum Arzt wenn: Ein Kind über 18 Monate nicht selbstständig geht oder Gehen wieder verlernt.\nDringend abklären: Sehr häufiges Hinfallen, Schwierigkeiten beim Treppensteigen, auffällig "watschelnder" Gang, das Kind stemmt sich beim Aufstehen mit den Händen die Beine hoch (Gowers-Zeichen).\nBei bekannter DMD — Notaufnahme bei: plötzlicher Atemnot, starkem Herzrasen oder Brustschmerzen.'),
      },
      curatedLinks: [
        { category: 'self_help', title: 'Duchenne Deutschland e.V.', url: 'https://www.duchenne-deutschland.de', language: 'de', description: 'Größte deutschsprachige Patientenorganisation für DMD und BMD. Beratung, Veranstaltungen, Forschungsförderung.', lastChecked: '2026-06-11' },
        { category: 'clinical', title: 'Orphanet — Duchenne-Muskeldystrophie', url: 'https://www.orpha.net/de/disease/detail/98896', language: 'de', description: 'Vollständiges klinisches Profil, Expertenzentren und Forschungsregister auf der offiziellen seltene-Erkrankungen-Datenbank.', lastChecked: '2026-06-11' },
        { category: 'layperson', title: 'Gesundheit.gv.at — Muskeldystrophie', url: 'https://www.gesundheit.gv.at/krankheiten/muskeln-knochen/muskeldystrophie', language: 'de', description: 'Offizielle österreichische Gesundheitsplattform mit verständlicher Erklärung.', lastChecked: '2026-06-11' },
        { category: 'research', title: 'ClinicalTrials.gov — Duchenne', url: 'https://clinicaltrials.gov/search?cond=Duchenne+Muscular+Dystrophy', language: 'en', description: 'Aktuelle klinische Studien weltweit — Teilnahme kann Zugang zu neuen Therapien ermöglichen.', lastChecked: '2026-06-11' },
        { category: 'emergency', title: 'Gesundheitstelefon 1450', url: 'https://www.gesundheit.gv.at/service/gesundheitstelefon', language: 'de', description: 'Kostenlose medizinische Erstberatung in Österreich — 24/7, auf Deutsch und mehreren Sprachen.', lastChecked: '2026-06-11' },
      ],
      status: 'draft',
    },
  },

  // ── 2. Marfan-Syndrom ────────────────────────────────────────────────────────
  {
    slug: 'marfan-syndrom',
    data: {
      name: 'Marfan-Syndrom',
      primaryEtiology: 'genetic',
      mechanismSubtype: 'monogenic',
      organSystems: ['cardiovascular', 'musculoskeletal', 'visual'],
      modifiers: { courseModifier: 'chronic', diagnosticModalities: ['clinical', 'imaging', 'genetics'] },
      briefDescription: 'Das Marfan-Syndrom ist eine genetische Erkrankung des Bindegewebes, die vor allem das Herz, die Augen und das Skelett betrifft. Menschen mit Marfan-Syndrom sind oft ungewöhnlich groß und schlank, haben lange Arme und Finger. Die gefährlichste Komplikation ist eine Erweiterung der Hauptschlagader (Aortenaneurysma), die ohne rechtzeitige Behandlung lebensbedrohlich sein kann. Mit guter medizinischer Betreuung können viele Betroffene ein normales Leben führen.',
      editorialTags: [
        { tag: 'Bindegewebe' },
        { tag: 'Herz & Aorta' },
        { tag: 'Augen' },
        { tag: 'Groß & schlank' },
        { tag: 'Erblich' },
        { tag: 'Alle Altersgruppen' },
        { tag: 'Regelmäßige Kontrollen wichtig' },
      ],
      doctorGuidance: {
        urgencyNote: 'soon',
        firstContact: rt('Bei Verdacht auf Marfan-Syndrom — z.B. ungewöhnlich großer Wuchs in der Familie, Sehprobleme oder unerklärliche Herzgeräusche — ist der Hausarzt oder die Hausärztin der erste Schritt.\nSie überweisen dann zur Humangenetik für eine Diagnosebestätigung sowie zur Kardiologie für die Herzuntersuchung.\nBei Kindern übernimmt der Kinderarzt die erste Einschätzung.'),
        specialtiesNote: rt('Kardiologie: Zentral, da Aortenveränderungen die größte Gefahr darstellen. Regelmäßige Echokardiographien (Herzultraschall) sind Pflicht.\nHumangenetik: Bestätigt die Diagnose durch Genanalyse (FBN1-Gen) und berät bei Familienplanung.\nOphthalmologie: Linsenverlagerung (Ektopia lentis) ist ein Marfan-Leitsymptom — Augenuntersuchung bei Diagnose notwendig.\nOrthopädie: Skoliose, Trichterbrust oder Plattfüße sind häufige Begleiterscheinungen.'),
        diagnosticJourney: rt('Die Diagnose wird nach den Ghent-Kriterien gestellt — einem Punktesystem aus verschiedenen körperlichen Merkmalen und Gentests.\nViele Betroffene werden erst im Jugend- oder Erwachsenenalter diagnostiziert, weil die Merkmale sich erst mit der Zeit vollständig zeigen.\nEin Gentest auf Mutationen im FBN1-Gen kann die Diagnose bestätigen, ist aber nicht zwingend — die klinische Diagnose ist ebenso gültig.\nDurchschnittliche Diagnoseverzögerung: 2–5 Jahre.'),
        redFlagSymptoms: rt('Notfall (sofort 144 rufen): Plötzlicher, reißender Brustschmerz oder Rückenschmerz — das kann ein Aortenriss sein.\nDringend abklären: Plötzlicher Sehverlust oder "Vorhang vor dem Auge" (Netzhautablösung), neues Herzgeräusch, starke Kurzatmigkeit.\nBei bekanntem Marfan-Syndrom: intensive Sportarten und Kontaktsportarten vermeiden — Rücksprache mit Kardiologen.'),
      },
      curatedLinks: [
        { category: 'self_help', title: 'Deutsche Marfan Hilfe e.V.', url: 'https://www.marfan.de', language: 'de', description: 'Patientenorganisation mit Beratung, Selbsthilfegruppen und Informationen auf Deutsch.', lastChecked: '2026-06-11' },
        { category: 'clinical', title: 'Orphanet — Marfan-Syndrom', url: 'https://www.orpha.net/de/disease/detail/558', language: 'de', description: 'Klinisches Profil, Expertenzentren in Österreich und Diagnosekriterien.', lastChecked: '2026-06-11' },
        { category: 'layperson', title: 'Netdoktor.at — Marfan-Syndrom', url: 'https://www.netdoktor.at/krankheiten/marfan-syndrom', language: 'de', description: 'Verständliche Erklärung von Symptomen, Diagnose und Behandlung auf Österreichisch.', lastChecked: '2026-06-11' },
        { category: 'research', title: 'ClinicalTrials.gov — Marfan Syndrome', url: 'https://clinicaltrials.gov/search?cond=Marfan+Syndrome', language: 'en', description: 'Aktuelle internationale Studien zu neuen Therapieansätzen beim Marfan-Syndrom.', lastChecked: '2026-06-11' },
        { category: 'emergency', title: 'Gesundheitstelefon 1450', url: 'https://www.gesundheit.gv.at/service/gesundheitstelefon', language: 'de', description: 'Kostenlose medizinische Erstberatung in Österreich — 24/7.', lastChecked: '2026-06-11' },
      ],
      status: 'draft',
    },
  },

  // ── 3. Phenylketonurie (PKU) ─────────────────────────────────────────────────
  {
    slug: 'phenylketonurie',
    data: {
      name: 'Phenylketonurie (PKU)',
      primaryEtiology: 'genetic',
      mechanismSubtype: 'enzyme_defect',
      organSystems: ['neurological', 'endocrine_metabolic'],
      modifiers: { courseModifier: 'chronic', diagnosticModalities: ['laboratory', 'genetics'] },
      briefDescription: 'Phenylketonurie (PKU) ist eine seltene angeborene Stoffwechselerkrankung. Betroffene können die Aminosäure Phenylalanin nicht richtig abbauen — sie sammelt sich im Blut und schädigt das Gehirn. In Österreich wird PKU bei allen Neugeborenen im Fersenbluttest untersucht, sodass die Erkrankung fast immer kurz nach der Geburt entdeckt wird. Mit einer lebenslangen phenylalaninarmen Ernährung und regelmäßiger medizinischer Kontrolle können Betroffene heute ein vollkommen normales Leben führen.',
      editorialTags: [
        { tag: 'Stoffwechsel' },
        { tag: 'Neugeborenenscreening' },
        { tag: 'Ernährung entscheidend' },
        { tag: 'Erblich' },
        { tag: 'Gehirn' },
        { tag: 'Lebenslang therapierbar' },
      ],
      doctorGuidance: {
        urgencyNote: 'routine',
        firstContact: rt('PKU wird in Österreich standardmäßig beim Neugeborenen-Screening (Fersenbluttest) zwischen dem 2. und 5. Lebenstag erfasst — die meisten Kinder werden so frühzeitig erkannt, noch bevor Symptome auftreten.\nBei positivem Screening-Ergebnis erfolgt sofort die Überweisung an ein Stoffwechselzentrum.\nErwachsene mit noch nicht diagnostizierten Entwicklungsverzögerungen unklarer Ursache sollten den Hausarzt kontaktieren, der einen Aminosäurentest im Blut veranlasst.'),
        specialtiesNote: rt('Stoffwechselmedizin / Metabolik (Kinderklinik): Zentrale Anlaufstelle für Diagnose, Ernährungsplanung und lebenslange Verlaufskontrollen.\nNeurologie: Bei neurologischen Folgeschäden (durch späte oder unzureichend behandelte PKU) notwendig.\nDiätologie: Die Phenylalanin-arme Ernährung ist komplex — professionelle Ernährungsberatung ist unerlässlich.\nGynäkologie / Geburtshilfe: Schwangere Frauen mit PKU benötigen besonders engmaschige Kontrollen (maternale PKU).'),
        diagnosticJourney: rt('In Österreich wird PKU bei fast allen Neugeborenen im Screening erkannt. Der Fersenbluttest ist kostenlos und verpflichtend.\nBei auffälligem Wert folgt ein Bestätigungstest mit erweiterter Aminosäurenanalyse aus dem Blut.\nGenetische Testung (PAH-Gen) bestätigt die Diagnose und hilft bei der Familienplanung.\nBei Erwachsenen, die vor der Screening-Ära geboren wurden: Diagnose durch erhöhte Phenylalanin-Werte im Blut.'),
        redFlagSymptoms: rt('Bei ungescreenten Kindern (z.B. Geburten außerhalb Österreichs): Entwicklungsverzögerung, Krampfanfälle, Verhaltensauffälligkeiten und helle Haut/Haare im ersten Lebensjahr → dringend zum Kinderarzt.\nBei bekannter PKU: Schlechte Ernährungsführung in der Schwangerschaft kann das ungeborene Kind schwer schädigen → sofort zum Stoffwechselzentrum.\nPlötzliche kognitive Verschlechterung bei Erwachsenen mit PKU: Neurologen aufsuchen.'),
      },
      curatedLinks: [
        { category: 'self_help', title: 'PKU Austria — Selbsthilfegruppe', url: 'https://www.pku.at', language: 'de', description: 'Österreichische PKU-Selbsthilfe mit Beratung, Rezepten und Vernetzung für Betroffene und Familien.', lastChecked: '2026-06-11' },
        { category: 'clinical', title: 'Orphanet — Phenylketonurie', url: 'https://www.orpha.net/de/disease/detail/716', language: 'de', description: 'Vollständiges klinisches Profil, Leitlinien und Expertenzentren in Österreich.', lastChecked: '2026-06-11' },
        { category: 'layperson', title: 'Gesundheit.gv.at — Neugeborenen-Screening', url: 'https://www.gesundheit.gv.at/leben/kinder/neugeborene/neugeborenenscreening', language: 'de', description: 'Offizielles österreichisches Gesundheitsportal zum Neugeborenenscreening inkl. PKU.', lastChecked: '2026-06-11' },
        { category: 'research', title: 'ESPKU — European Society for PKU', url: 'https://www.espku.org', language: 'en', description: 'Europäische Patientenorganisation mit aktuellen Forschungsinfos und Studiendatenbank.', lastChecked: '2026-06-11' },
        { category: 'emergency', title: 'Gesundheitstelefon 1450', url: 'https://www.gesundheit.gv.at/service/gesundheitstelefon', language: 'de', description: 'Kostenlose medizinische Erstberatung in Österreich — 24/7.', lastChecked: '2026-06-11' },
      ],
      status: 'draft',
    },
  },

  // ── 4. Systemischer Lupus Erythematodes (SLE) ────────────────────────────────
  {
    slug: 'systemischer-lupus-erythematodes',
    data: {
      name: 'Systemischer Lupus Erythematodes (SLE)',
      primaryEtiology: 'autoimmune',
      mechanismSubtype: 'systemic_autoimmune',
      organSystems: ['hematological_immunological', 'dermatological', 'neurological', 'urogenital', 'cardiovascular'],
      modifiers: { courseModifier: 'recurrent', diagnosticModalities: ['clinical', 'laboratory', 'imaging'] },
      briefDescription: 'Systemischer Lupus Erythematodes (SLE) ist eine Autoimmunerkrankung, bei der das Immunsystem versehentlich gesundes Körpergewebe angreift. Sie kann praktisch jedes Organ betreffen — Haut, Gelenke, Nieren, Herz, Lunge und das Nervensystem. Das bekannteste Zeichen ist ein schmetterlingsförmiger Ausschlag im Gesicht. SLE verläuft in Schüben mit Phasen der Besserung und Verschlechterung. Die Erkrankung betrifft vor allem Frauen im gebärfähigen Alter. Mit moderner Therapie können die meisten Betroffenen gut leben.',
      editorialTags: [
        { tag: 'Autoimmun' },
        { tag: 'Multisystemisch' },
        { tag: 'Frauen' },
        { tag: 'Schmetterlings-Ausschlag' },
        { tag: 'Gelenke & Haut' },
        { tag: 'Schübe' },
        { tag: 'Unsichtbare Erkrankung' },
        { tag: 'Diagnose dauert oft Jahre' },
      ],
      doctorGuidance: {
        urgencyNote: 'soon',
        firstContact: rt('Bei anhaltenden Gelenkschmerzen, unerklärlicher Erschöpfung, Hautausschlägen (besonders nach Sonnenlicht) und wiederkehrenden Fieberschüben ist der Hausarzt oder die Hausärztin der erste Ansprechpartner.\nSie veranlassen erste Bluttests (ANA-Antikörper-Test) — ein positiver ANA-Test ist kein Beweis für SLE, aber ein wichtiger Hinweis.\nBei Verdacht erfolgt die Überweisung zur Rheumatologie.'),
        specialtiesNote: rt('Rheumatologie: Stellt die Diagnose nach den ACR/EULAR-Kriterien und koordiniert die Langzeittherapie.\nNephrologie: Bei Nierenbeteiligung (Lupusnephritis) — eine der ernsteren Komplikationen.\nDermatologie: Für Hautmanifestationen und lichtschutzbegleitende Therapie.\nNeurologie: Bei neurologischem Lupus (Krampfanfälle, Psychosen, Schlaganfall als seltene Komplikationen).\nGynäkologie: SLE und Schwangerschaft erfordert intensive Betreuung — Planung mit dem Rheumatologen ist wichtig.'),
        diagnosticJourney: rt('SLE ist eine der am häufigsten spät diagnostizierten Erkrankungen — durchschnittlich vergehen 6 Jahre bis zur Diagnose, weil die Symptome vielfältig und wechselnd sind.\nDie Diagnose basiert auf klinischen Kriterien (Hautveränderungen, Gelenke, Organbeteiligung) plus Laborwerten (ANA, Anti-dsDNA, Komplement C3/C4).\nEin einzelner Bluttest reicht nicht — die Diagnose braucht Zeit und oft mehrere Spezialistenbesuche.\nWichtig: Nicht jede Person mit positivem ANA hat SLE — der ANA ist auch bei vielen anderen Erkrankungen positiv.'),
        redFlagSymptoms: rt('Sofort Notaufnahme (144): Plötzliche starke Kopfschmerzen, Krampfanfälle, Verwirrtheit oder Schlaganfallsymptome bei bekanntem SLE.\nDringend zum Arzt: Blut im Urin (kann auf Lupusnephritis hindeuten), plötzlich geschwollene Beine, starke Brustschmerzen oder Atemnot.\nBei bekanntem SLE: Intensives Sonnen vermeiden — UV-Licht kann einen Schub auslösen.'),
      },
      curatedLinks: [
        { category: 'self_help', title: 'Lupus Austria — Selbsthilfegruppe', url: 'https://www.lupus-austria.at', language: 'de', description: 'Österreichische Selbsthilfe für Lupus-Betroffene mit Beratung und regionalen Gruppen.', lastChecked: '2026-06-11' },
        { category: 'clinical', title: 'Orphanet — Systemischer Lupus Erythematodes', url: 'https://www.orpha.net/de/disease/detail/536', language: 'de', description: 'Klinisches Profil, Diagnosekriterien und Expertenzentren in Österreich.', lastChecked: '2026-06-11' },
        { category: 'layperson', title: 'Netdoktor.at — Lupus', url: 'https://www.netdoktor.at/krankheiten/lupus-erythematodes', language: 'de', description: 'Verständliche Erklärung von SLE — Symptome, Diagnose, Behandlung und Leben mit Lupus.', lastChecked: '2026-06-11' },
        { category: 'research', title: 'LUPUS EUROPE — Forschung & Studien', url: 'https://www.lupus-europe.org', language: 'en', description: 'Europäisches Lupus-Netzwerk mit aktuellen Forschungsinfos und Studienregister.', lastChecked: '2026-06-11' },
        { category: 'emergency', title: 'Gesundheitstelefon 1450', url: 'https://www.gesundheit.gv.at/service/gesundheitstelefon', language: 'de', description: 'Kostenlose medizinische Erstberatung in Österreich — 24/7.', lastChecked: '2026-06-11' },
      ],
      status: 'draft',
    },
  },

  // ── 5. Zystische Fibrose (Mukoviszidose) ────────────────────────────────────
  {
    slug: 'zystische-fibrose',
    data: {
      name: 'Zystische Fibrose (Mukoviszidose)',
      primaryEtiology: 'genetic',
      mechanismSubtype: 'monogenic',
      organSystems: ['respiratory', 'gastrointestinal', 'reproductive'],
      modifiers: { courseModifier: 'chronic', diagnosticModalities: ['clinical', 'laboratory', 'genetics'] },
      briefDescription: 'Zystische Fibrose (ZF), auch Mukoviszidose genannt, ist die häufigste lebensverkürzende genetische Erkrankung in Europa. Betroffene produzieren einen ungewöhnlich zähen Schleim, der vor allem Lunge und Verdauungssystem verstopft. Das führt zu chronischen Lungeninfektionen und Verdauungsproblemen. In Österreich wird ZF beim Neugeborenen-Screening erkannt. Mit modernen CFTR-Modulatoren (neuen Medikamenten) hat sich die Lebensqualität in den letzten Jahren dramatisch verbessert — viele Betroffene erreichen heute ein normales Erwachsenenalter.',
      editorialTags: [
        { tag: 'Lunge' },
        { tag: 'Verdauung' },
        { tag: 'Erblich' },
        { tag: 'Neugeborenenscreening' },
        { tag: 'Chronisch' },
        { tag: 'Neue Medikamente verfügbar' },
        { tag: 'Physiotherapie täglich' },
      ],
      doctorGuidance: {
        urgencyNote: 'routine',
        firstContact: rt('Zystische Fibrose wird in Österreich beim Neugeborenen-Screening (Fersenbluttest) erkannt. Bei positivem Ergebnis erfolgt sofort die Überweisung an ein CF-Zentrum.\nBei Jugendlichen oder Erwachsenen mit chronischem Husten, häufigen Lungeninfektionen, schlechter Gewichtszunahme und salzigem Schweiß: Hausarzt aufsuchen, der einen Schweißtest veranlasst.'),
        specialtiesNote: rt('Pneumologie (CF-Zentrum): Zentrale Anlaufstelle für die gesamte Betreuung. In Österreich gibt es spezialisierte CF-Ambulanzen an den großen Universitätskliniken.\nGastroenterologie: Verdauungsprobleme, Bauchspeicheldrüseninsuffizienz und Leberbeteiligung werden hier behandelt.\nDiätologie: Betroffene brauchen oft deutlich mehr Kalorien als gesunde Menschen — Ernährungsberatung ist Teil der Standardversorgung.\nInfektiologie: Lungeninfektionen mit resistenten Keimen (z.B. Pseudomonas) sind eine zentrale Herausforderung.\nReproduktionsmedizin: Männer mit ZF sind fast immer unfruchtbar — Beratung vor Familienplanung wichtig.'),
        diagnosticJourney: rt('Der Schweißtest (Chloridkonzentration im Schweiß > 60 mmol/l) ist der Goldstandard der Diagnose.\nEin Gentest auf CFTR-Mutationen bestätigt die Diagnose und ist wichtig für die Therapieplanung (nicht alle Mutationen sprechen auf neue Medikamente an).\nIn Österreich wird ZF durch das Neugeborenenscreening meist innerhalb der ersten Lebenswochen erkannt.\nBei Erwachsenen ohne Screening: Durchschnittliche Diagnoseverzögerung von mehreren Jahren möglich.'),
        redFlagSymptoms: rt('Sofort Notaufnahme: Atemnot in Ruhe, Blut im Auswurf, plötzliche Verschlechterung des Allgemeinzustands.\nDringend zum CF-Zentrum: Neue oder veränderte Keime im Auswurf, starker Gewichtsverlust, Zunahme der Hustenfrequenz trotz Therapie.\nBei Kindern: Schlechte Gewichtszunahme, Fettstühle (ölig, übelriechend) oder häufige Lungenentzündungen → sofort zum Kinderarzt.'),
      },
      curatedLinks: [
        { category: 'self_help', title: 'Mukoviszidose Österreich', url: 'https://www.muko.at', language: 'de', description: 'Österreichische Patientenorganisation für Mukoviszidose mit Beratung, Veranstaltungen und Selbsthilfegruppen.', lastChecked: '2026-06-11' },
        { category: 'clinical', title: 'Orphanet — Zystische Fibrose', url: 'https://www.orpha.net/de/disease/detail/586', language: 'de', description: 'Klinisches Profil, Expertenzentren in Österreich und aktuelle Therapieleitlinien.', lastChecked: '2026-06-11' },
        { category: 'layperson', title: 'Gesundheit.gv.at — Mukoviszidose', url: 'https://www.gesundheit.gv.at/krankheiten/lunge/mukoviszidose', language: 'de', description: 'Offizielle österreichische Gesundheitsplattform mit Erklärung und Ratschlägen für Betroffene.', lastChecked: '2026-06-11' },
        { category: 'research', title: 'ECFS — European Cystic Fibrosis Society', url: 'https://www.ecfs.eu', language: 'en', description: 'Europäische CF-Fachgesellschaft mit Forschungsregister und Patientenportal.', lastChecked: '2026-06-11' },
        { category: 'emergency', title: 'Gesundheitstelefon 1450', url: 'https://www.gesundheit.gv.at/service/gesundheitstelefon', language: 'de', description: 'Kostenlose medizinische Erstberatung in Österreich — 24/7.', lastChecked: '2026-06-11' },
      ],
      status: 'draft',
    },
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏥 WohinMedizin — Pilot-Content Seed')
  console.log(`   Modus: ${DRY_RUN ? 'DRY-RUN (keine Änderungen)' : 'LIVE'}`)
  console.log(`   ${PILOT_DISEASES.length} Krankheiten\n`)

  const email = requireEnv('PAYLOAD_ADMIN_EMAIL')
  const pass  = requireEnv('PAYLOAD_ADMIN_PASSWORD')

  console.log('🔑 Payload-Login…')
  const token = await getToken(email, pass)
  console.log('✅ Eingeloggt\n')

  let success = 0, errors = 0

  for (const { slug, data } of PILOT_DISEASES) {
    console.log(`📋 ${data.name}`)
    try {
      await upsertDisease(token, slug, data)
      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌ ${msg.slice(0, 200)}`)
      errors++
    }
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ ${success} erfolgreich, ${errors} Fehler`)
  if (DRY_RUN) console.log('ℹ️  DRY-RUN — keine Daten geschrieben')
  console.log()
}

main().catch(err => {
  console.error('\n💥 Fehler:', err)
  process.exit(1)
})
