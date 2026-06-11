import type { RawApifyResult, EntityType, ComplianceClass } from './types.ts'

const NATURAL_PERSON_PATTERNS = [
  /\bdr\.?\s+\w+/i,
  /\bDDr\.?\s+\w+/i,
  /\bMag\.?\s+\w+/i,
  /\bProf\.?\s+\w+/i,
  /ordination\s+\w+\s+\w+/i,
]

const ENTITY_TYPE_MAP: Array<[RegExp, EntityType]> = [
  [/primärversorgung|pvz|pve/i, 'pvz'],
  [/gesundheitszentrum|gesundheits.?zentrum/i, 'gesundheitszentrum'],
  [/gruppenpraxis/i, 'gruppenpraxis'],
  [/ambulatorium/i, 'ambulatorium'],
  [/zahnarzt|zahnärztin|zahnzentrum/i, 'zahnarzt'],
  [/physiotherap/i, 'physiotherapie'],
  [/psychotherap/i, 'psychotherapie'],
  [/ordination|hausarzt|allgemeinmedizin|kinderarzt|gynäkolog|orthopäd|dermatolog|internist/i, 'einzelordination'],
]

export function detectEntityType(raw: RawApifyResult): EntityType | null {
  const text = [raw.title, raw.categoryName, ...(raw.categories ?? [])].join(' ')
  for (const [pattern, type] of ENTITY_TYPE_MAP) {
    if (pattern.test(text)) return type
  }
  return null
}

export function isNaturalPerson(raw: RawApifyResult): boolean {
  const name = raw.title ?? ''
  return NATURAL_PERSON_PATTERNS.some((p) => p.test(name))
}

export function classifyCompliance(
  entityType: EntityType | null,
  natural: boolean,
): ComplianceClass {
  if (entityType === 'gesundheitszentrum' || entityType === 'pvz' || entityType === 'ambulatorium') {
    return 'A'
  }
  if (natural) return 'B'
  if (entityType === 'gruppenpraxis') return 'A'
  return 'B'
}

export function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null
  // Österreichisches Format: +43 ...
  return raw.replace(/\s+/g, ' ').trim() || null
}

export function normalizeWebsite(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.origin + url.pathname.replace(/\/$/, '')
  } catch {
    return raw.trim() || null
  }
}
