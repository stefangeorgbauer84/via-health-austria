/**
 * WohinMedizin — ICD-11 Code Fill
 *
 * Holt ICD-11 Codes für alle Erkrankungen via Orphadata Cross-Referencing API
 * und schreibt sie direkt in die DB (pg, kein Payload-Overhead).
 *
 * Läuft standalone — kein Dev-Server nötig.
 *
 * Ausführen:
 *   npx tsx scripts/orphadata/icd11-fill.ts --dry-run
 *   npx tsx scripts/orphadata/icd11-fill.ts --limit 100
 *   npx tsx scripts/orphadata/icd11-fill.ts
 */

import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pool } from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(process.cwd(), '.env.local') })

const args   = process.argv.slice(2)
const DRY    = args.includes('--dry-run')
const LIMIT  = (() => { const i = args.indexOf('--limit'); return i !== -1 ? parseInt(args[i+1],10) : Infinity })()
const DELAY  = 120   // ms between requests — stay below Orphadata rate limit
const CONCUR = 8     // parallel requests

// ─── Fetch with timeout ───────────────────────────────────────────────────────

async function fetchJson<T>(url: string, timeoutMs = 10_000): Promise<T | null> {
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  } finally {
    clearTimeout(tid)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🏥 WohinMedizin — ICD-11 Fill')
  console.log(`   Modus: ${DRY ? 'DRY-RUN' : 'LIVE'}`)
  console.log(`   Limit: ${LIMIT === Infinity ? 'alle' : LIMIT}\n`)

  const pool = new Pool({ connectionString: process.env.DATABASE_URI! })

  // Load diseases that have an ORPHA code but no ICD-11 yet
  const { rows } = await pool.query<{ id: number; codes_orpha_code: string }>(`
    SELECT id, codes_orpha_code
    FROM   diseases
    WHERE  codes_orpha_code IS NOT NULL
      AND  (codes_icd11_chapter_anchor IS NULL OR codes_icd11_chapter_anchor = '')
    ORDER  BY id
    ${LIMIT !== Infinity ? `LIMIT ${LIMIT}` : ''}
  `)

  console.log(`📋 ${rows.length} Erkrankungen ohne ICD-11 Code\n`)

  let found = 0, notFound = 0, errors = 0, done = 0
  const total = rows.length

  // Process in batches of CONCUR
  for (let i = 0; i < rows.length; i += CONCUR) {
    const batch = rows.slice(i, i + CONCUR)

    await Promise.all(batch.map(async (row) => {
      const orphaNum = row.codes_orpha_code.replace('ORPHA:', '')
      const url = `https://api.orphadata.com/rd-cross-referencing/orphacodes/${orphaNum}`

      const data = await fetchJson<{ data: { results: { ExternalReference?: Array<{ Source: string; Reference: string; DisorderMappingRelation: string }> } } }>(url)

      const refs = data?.data?.results?.ExternalReference ?? []
      const icd11 = refs.find(r => r.Source === 'ICD-11')

      done++
      if (done % 500 === 0) {
        console.log(`  ${done}/${total} — gefunden: ${found}, nicht in Orphadata: ${notFound}, Fehler: ${errors}`)
      }

      if (!icd11) {
        notFound++
        return
      }

      found++
      if (DRY) return

      try {
        await pool.query(
          `UPDATE diseases SET codes_icd11_chapter_anchor = $1 WHERE id = $2`,
          [icd11.Reference, row.id]
        )
      } catch (e) {
        errors++
        console.error(`  ❌ DB-Fehler für ID ${row.id}: ${(e as Error).message.slice(0,80)}`)
      }
    }))

    // Rate-limit pause between batches
    if (i + CONCUR < rows.length) {
      await new Promise(r => setTimeout(r, DELAY))
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ Fertig`)
  console.log(`   ICD-11 gefunden & gesetzt: ${found}`)
  console.log(`   Kein ICD-11 in Orphadata:  ${notFound}`)
  console.log(`   Fehler:                    ${errors}`)
  if (DRY) console.log('ℹ️  DRY-RUN — keine Änderungen geschrieben')

  await pool.end()
}

main().catch(e => { console.error('💥', e); process.exit(1) })
