/**
 * WohinMedizin — Healthcare Data Extraction Pilot
 *
 * Startet Apify Google Maps Scraper Runs für die Suchmatrix
 * und schreibt bereinigte Ergebnisse direkt in Neon.
 *
 * Ausführen (Pilot, Wien, 3 Kategorien, max 50 Ergebnisse pro Suche):
 *   npx tsx scripts/healthcare/extract.ts --pilot
 *
 * Ausführen (vollständig):
 *   npx tsx scripts/healthcare/extract.ts
 *
 * Pflichtenv:
 *   APIFY_API_TOKEN    — Apify Token
 *   DATABASE_URI       — Neon Postgres Connection String
 *
 * Kein ANTHROPIC_API_KEY nötig.
 */

import { ApifyClient } from 'apify-client'
import pg from 'pg'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Lade zuerst .env.local (DATABASE_URI), dann scripts/healthcare/secrets.env (APIFY_API_TOKEN)
config({ path: path.resolve(process.cwd(), '.env.local') })
config({ path: path.resolve(__dirname, 'secrets.env') })
import { buildSearchMatrix } from './search-matrix.ts'
import { detectEntityType, isNaturalPerson, classifyCompliance, normalizePhone, normalizeWebsite } from './classify.ts'
import type { RawApifyResult } from './types.ts'

const { Pool } = pg

// Apify Actor — Google Maps Places Scraper (community actor)
// Tausch diesen durch deinen bevorzugten Actor aus, falls nötig.
const ACTOR_ID = 'compass/crawler-google-places'

const PILOT_CATEGORIES = ['Hausarzt', 'Allgemeinmediziner', 'Gesundheitszentrum']
const IS_PILOT = process.argv.includes('--pilot')
const MAX_PER_SEARCH = IS_PILOT ? 50 : 100
const CONCURRENT_RUNS = 3  // Apify Runs gleichzeitig

async function main() {
  const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
  const pool = new Pool({ connectionString: process.env.DATABASE_URI })

  const matrix = buildSearchMatrix(
    IS_PILOT
      ? { categoriesSubset: PILOT_CATEGORIES, wienOnly: true, maxPerRegion: 3 }
      : undefined
  )

  console.log(`Modus: ${IS_PILOT ? 'PILOT' : 'VOLLSTÄNDIG'}`)
  console.log(`Suchanfragen: ${matrix.length}`)
  console.log(`Max. Ergebnisse pro Suche: ${MAX_PER_SEARCH}`)
  console.log('---')

  // Batching: CONCURRENT_RUNS parallel
  for (let i = 0; i < matrix.length; i += CONCURRENT_RUNS) {
    const batch = matrix.slice(i, i + CONCURRENT_RUNS)
    await Promise.all(batch.map((entry) => processSearch(entry, apify, pool)))
    console.log(`Fortschritt: ${Math.min(i + CONCURRENT_RUNS, matrix.length)} / ${matrix.length}`)
  }

  await pool.end()
  console.log('Extraktion abgeschlossen.')
}

async function processSearch(
  entry: { query: string; region: string; federalState: string },
  apify: ApifyClient,
  pool: pg.Pool,
) {
  const client = await pool.connect()
  const startedAt = new Date()
  let runRecord: { id: string } | null = null

  try {
    // Scraping Run in DB anlegen
    const runInsert = await client.query<{ id: string }>(
      `INSERT INTO hc_scraping_runs
         (provider, actor_id, search_query, federal_state, max_results, started_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,'running')
       RETURNING id`,
      ['apify', ACTOR_ID, entry.query, entry.federalState, MAX_PER_SEARCH, startedAt],
    )
    runRecord = runInsert.rows[0]

    // Apify Run starten und warten
    const run = await apify.actor(ACTOR_ID).call({
      searchStringsArray: [entry.query],
      maxCrawledPlacesPerSearch: MAX_PER_SEARCH,
      includeOpeningHours: false,
      includeReviews: false,       // Reviews NICHT speichern — Compliance
      maxReviewsPerPlace: 0,
      closedPlacesFilter: 'skipClosed',
      language: 'de',
    })

    const items: RawApifyResult[] = await apify
      .dataset(run.defaultDatasetId)
      .listItems()
      .then((r) => r.items as RawApifyResult[])

    let cleaned = 0
    let duplicates = 0

    for (const item of items) {
      const result = await upsertEntity(client, item, entry.query, run.id, run.defaultDatasetId)
      if (result === 'inserted') cleaned++
      if (result === 'duplicate') duplicates++
    }

    // Run-Ergebnis aktualisieren
    await client.query(
      `UPDATE hc_scraping_runs
       SET status='completed', finished_at=$1,
           raw_result_count=$2, cleaned_result_count=$3, duplicate_count=$4,
           apify_run_id=$5, apify_dataset_id=$6
       WHERE id=$7`,
      [new Date(), items.length, cleaned, duplicates, run.id, run.defaultDatasetId, runRecord.id],
    )

    console.log(`✓ ${entry.query} — ${items.length} roh, ${cleaned} neu, ${duplicates} doppelt`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`✗ ${entry.query}: ${msg}`)
    if (runRecord) {
      await client.query(
        `UPDATE hc_scraping_runs SET status='failed', finished_at=$1, error_message=$2 WHERE id=$3`,
        [new Date(), msg, runRecord.id],
      )
    }
  } finally {
    client.release()
  }
}

async function upsertEntity(
  client: pg.PoolClient,
  item: RawApifyResult,
  searchQuery: string,
  apifyRunId: string,
  apifyDatasetId: string,
): Promise<'inserted' | 'duplicate' | 'skipped'> {
  if (!item.title) return 'skipped'
  if (item.permanentlyClosed) return 'skipped'

  // Duplikat-Check über Google Place ID
  if (item.placeId) {
    const existing = await client.query(
      `SELECT entity_id FROM hc_entity_sources WHERE google_place_id=$1 LIMIT 1`,
      [item.placeId],
    )
    if (existing.rows.length > 0) return 'duplicate'
  }

  const entityType = detectEntityType(item)
  const natural = isNaturalPerson(item)
  const complianceClass = classifyCompliance(entityType, natural)
  const phone = normalizePhone(item.phone ?? item.phoneUnformatted)
  const website = normalizeWebsite(item.website)

  // Entity einfügen
  const entityResult = await client.query<{ id: string }>(
    `INSERT INTO hc_entities
       (canonical_name, entity_type, primary_category, secondary_categories,
        address_line, postal_code, city, federal_state,
        latitude, longitude, phone, website,
        is_natural_person, compliance_class)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [
      item.title,
      entityType,
      item.categoryName ?? null,
      item.categories ?? [],
      item.address ?? null,
      item.postalCode ?? null,
      item.city ?? null,
      null,  // federal_state wird vom Scraping-Run befüllt
      item.location?.lat ?? null,
      item.location?.lng ?? null,
      phone,
      website,
      natural,
      complianceClass,
    ],
  )

  const entityId = entityResult.rows[0].id

  // Source einfügen (ohne Review-Texte)
  await client.query(
    `INSERT INTO hc_entity_sources
       (entity_id, source_type, source_name, google_place_id, google_maps_url,
        raw_name, raw_address, raw_phone, raw_website,
        rating, review_count, search_query, run_id, retrieved_at)
     VALUES ($1,'apify_google_maps','Google Maps',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())`,
    [
      entityId,
      item.placeId ?? null,
      item.url ?? null,
      item.title,
      item.address ?? null,
      item.phone ?? null,
      item.website ?? null,
      item.totalScore ?? null,
      item.reviewsCount ?? null,
      searchQuery,
      apifyRunId,
    ],
  )

  // Compliance-Flag anlegen
  await client.query(
    `INSERT INTO hc_compliance_flags
       (entity_id, contains_personal_data, contact_use_allowed, outreach_allowed,
        review_text_stored, photo_stored, legal_basis)
     VALUES ($1,$2,FALSE,FALSE,FALSE,FALSE,'berechtigtes_interesse_pruefung_ausstehend')`,
    [entityId, natural],
  )

  return 'inserted'
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
