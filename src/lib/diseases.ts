import { getPool } from './db'

export interface DiseaseListItem {
  id: number
  slug: string
  name: string
  orpha_code: string
  icd10_code: string | null
  prevalence: string | null
  brief_description: string | null
  organ_systems: string[]
}

export interface DiseaseDetail extends DiseaseListItem {
  omim_code: string | null
  primary_etiology: string | null
  course_modifier: string | null
  hpo_terms: Array<{ hpo_id: string; hpo_label: string }>
  inheritance: string[]
  age_of_onset: string[]
  symptoms: Array<{ name: string; hpo_code: string; category: string }>
  aliases: string[]
  disclaimer: string | null
}

export interface DiseaseListResult {
  diseases: DiseaseListItem[]
  total: number
}

const PAGE_SIZE = 24

export async function listDiseases(opts: {
  q?: string
  organ?: string
  page?: number
  locale?: string
}): Promise<DiseaseListResult> {
  const pool = getPool()
  const { q, organ, page = 1, locale = 'de' } = opts
  const offset = (page - 1) * PAGE_SIZE

  const params: unknown[] = [locale]
  let where = 'WHERE dl._locale = $1'
  let paramIdx = 2

  if (q) {
    where += ` AND dl.name ILIKE $${paramIdx++}`
    params.push(`%${q}%`)
  }
  if (organ) {
    where += ` AND EXISTS (
      SELECT 1 FROM diseases_organ_systems dos
      WHERE dos.parent_id = d.id AND dos.value = $${paramIdx++}
    )`
    params.push(organ)
  }

  const countSql = `
    SELECT COUNT(DISTINCT d.id)
    FROM diseases d
    JOIN diseases_locales dl ON dl._parent_id = d.id
    ${where}
  `
  const dataSql = `
    SELECT
      d.id, d.slug, dl.name,
      d.codes_orpha_code   AS orpha_code,
      d.codes_icd10_code   AS icd10_code,
      d.epidemiology_prevalence AS prevalence,
      LEFT(dl.brief_description, 180) AS brief_description,
      COALESCE(
        (SELECT array_agg(dos.value::text ORDER BY dos."order")
         FROM diseases_organ_systems dos WHERE dos.parent_id = d.id),
        ARRAY[]::text[]
      ) AS organ_systems
    FROM diseases d
    JOIN diseases_locales dl ON dl._parent_id = d.id
    ${where}
    ORDER BY dl.name
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `

  const [countRes, dataRes] = await Promise.all([
    pool.query(countSql, params),
    pool.query(dataSql, params),
  ])

  return {
    diseases: dataRes.rows,
    total: parseInt(countRes.rows[0].count, 10),
  }
}

export async function getDiseaseBySlug(
  slug: string,
  locale = 'de',
): Promise<DiseaseDetail | null> {
  const pool = getPool()

  const main = await pool.query<DiseaseDetail & { id: number }>(
    `SELECT
       d.id, d.slug,
       dl.name,
       d.codes_orpha_code   AS orpha_code,
       d.codes_icd10_code   AS icd10_code,
       d.codes_omim_code    AS omim_code,
       d.epidemiology_prevalence AS prevalence,
       d.primary_etiology,
       d.modifiers_course_modifier AS course_modifier,
       dl.brief_description,
       dl.disclaimer
     FROM diseases d
     JOIN diseases_locales dl ON dl._parent_id = d.id AND dl._locale = $2
     WHERE d.slug = $1`,
    [slug, locale],
  )
  if (!main.rows[0]) return null
  const d = main.rows[0]

  const [hpoRes, inheritRes, onsetRes, orgRes, symRes, aliasRes] = await Promise.all([
    pool.query(
      `SELECT hpo_id, hpo_label FROM diseases_codes_hpo_terms
       WHERE _parent_id = $1 ORDER BY _order LIMIT 30`,
      [d.id],
    ),
    pool.query(
      `SELECT value FROM diseases_epidemiology_inheritance WHERE parent_id = $1 ORDER BY "order"`,
      [d.id],
    ),
    pool.query(
      `SELECT value FROM diseases_epidemiology_age_of_onset WHERE parent_id = $1 ORDER BY "order"`,
      [d.id],
    ),
    pool.query(
      `SELECT value FROM diseases_organ_systems WHERE parent_id = $1 ORDER BY "order"`,
      [d.id],
    ),
    pool.query(
      `SELECT sl.name, s.hpo_code, s.category
       FROM diseases_rels dr
       JOIN symptoms s ON s.id = dr.symptoms_id
       JOIN symptoms_locales sl ON sl._parent_id = s.id AND sl._locale = $2
       WHERE dr.parent_id = $1 AND dr.path = 'symptomsRelationship'
       ORDER BY dr.order LIMIT 20`,
      [d.id, locale],
    ),
    pool.query(
      `SELECT alias FROM diseases_aliases WHERE _parent_id = $1 ORDER BY _order LIMIT 5`,
      [d.id],
    ),
  ])

  return {
    ...d,
    hpo_terms:   hpoRes.rows,
    inheritance: inheritRes.rows.map((r) => r.value),
    age_of_onset:onsetRes.rows.map((r) => r.value),
    organ_systems:orgRes.rows.map((r) => r.value),
    symptoms:    symRes.rows,
    aliases:     aliasRes.rows.map((r) => r.alias),
  }
}
