import pg from 'pg'
import { config } from 'dotenv'
config({ path: '.env.local' })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI })

async function check() {
  const r = await pool.query(`
    SELECT
      COUNT(*) as entities,
      COUNT(*) FILTER (WHERE is_natural_person) as natural_persons,
      COUNT(*) FILTER (WHERE compliance_class = 'A') as class_a,
      COUNT(*) FILTER (WHERE compliance_class = 'B') as class_b
    FROM hc_entities
  `)
  console.table(r.rows)

  const runs = await pool.query(`
    SELECT search_query, status, raw_result_count, cleaned_result_count, duplicate_count
    FROM hc_scraping_runs
    ORDER BY started_at DESC
    LIMIT 10
  `)
  console.log('\nLetzte Scraping Runs:')
  console.table(runs.rows)

  await pool.end()
}

check()
