/**
 * Erstellt die vier Healthcare-Rohtabellen in Neon.
 * Läuft neben dem Payload-Schema, berührt keine Payload-Tabellen.
 *
 * Ausführen: npx tsx scripts/healthcare/migrate.ts
 */

import pg from 'pg'
import { config } from 'dotenv'
config({ path: '.env.local' })

const { Pool } = pg

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URI })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS hc_entities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        canonical_name TEXT NOT NULL,
        entity_type TEXT,
        primary_category TEXT,
        secondary_categories TEXT[] DEFAULT '{}',
        address_line TEXT,
        postal_code TEXT,
        city TEXT,
        federal_state TEXT,
        country TEXT NOT NULL DEFAULT 'AT',
        latitude NUMERIC(10,7),
        longitude NUMERIC(10,7),
        phone TEXT,
        website TEXT,
        is_natural_person BOOLEAN NOT NULL DEFAULT FALSE,
        compliance_class TEXT NOT NULL DEFAULT 'A'
          CHECK (compliance_class IN ('A','B','C','D')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_verified_at TIMESTAMPTZ
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS hc_entity_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_id UUID REFERENCES hc_entities(id) ON DELETE CASCADE,
        source_type TEXT NOT NULL,
        source_name TEXT,
        google_place_id TEXT,
        google_maps_url TEXT,
        raw_name TEXT,
        raw_address TEXT,
        raw_phone TEXT,
        raw_website TEXT,
        rating NUMERIC(3,1),
        review_count INTEGER,
        search_query TEXT,
        run_id TEXT,
        retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS hc_scraping_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider TEXT NOT NULL,
        actor_id TEXT,
        search_query TEXT,
        location_query TEXT,
        federal_state TEXT,
        max_results INTEGER,
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        status TEXT,
        raw_result_count INTEGER,
        cleaned_result_count INTEGER,
        duplicate_count INTEGER,
        error_message TEXT,
        apify_run_id TEXT,
        apify_dataset_id TEXT
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS hc_compliance_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_id UUID REFERENCES hc_entities(id) ON DELETE CASCADE,
        contains_personal_data BOOLEAN NOT NULL DEFAULT FALSE,
        contact_use_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        outreach_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        review_text_stored BOOLEAN NOT NULL DEFAULT FALSE,
        photo_stored BOOLEAN NOT NULL DEFAULT FALSE,
        legal_basis TEXT,
        retention_until DATE,
        notes TEXT,
        assessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)

    // Indices
    await client.query(`
      CREATE INDEX IF NOT EXISTS hc_entities_postal_code_idx ON hc_entities(postal_code);
      CREATE INDEX IF NOT EXISTS hc_entities_federal_state_idx ON hc_entities(federal_state);
      CREATE INDEX IF NOT EXISTS hc_entities_entity_type_idx ON hc_entities(entity_type);
      CREATE INDEX IF NOT EXISTS hc_entities_compliance_class_idx ON hc_entities(compliance_class);
      CREATE UNIQUE INDEX IF NOT EXISTS hc_entity_sources_place_id_idx
        ON hc_entity_sources(google_place_id) WHERE google_place_id IS NOT NULL;
    `)

    await client.query('COMMIT')
    console.log('Migration erfolgreich. Tabellen: hc_entities, hc_entity_sources, hc_scraping_runs, hc_compliance_flags')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration fehlgeschlagen:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
