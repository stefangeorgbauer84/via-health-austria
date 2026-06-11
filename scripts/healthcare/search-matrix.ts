export interface SearchEntry {
  query: string
  region: string
  federalState: string
}

const CATEGORIES = [
  'Hausarzt',
  'Allgemeinmediziner',
  'Gesundheitszentrum',
  'Primärversorgungszentrum',
  'Gruppenpraxis',
  'Kinderarzt',
  'Zahnarzt',
  'Gynäkologe',
  'Orthopäde',
  'Dermatologe',
  'Internist',
  'Physiotherapie',
  'Psychotherapeut',
  'Ambulatorium',
]

// Wien: bezirksweise (PLZ 1010–1230)
const WIEN_DISTRICTS = [
  '1010', '1020', '1030', '1040', '1050',
  '1060', '1070', '1080', '1090', '1100',
  '1110', '1120', '1130', '1140', '1150',
  '1160', '1170', '1180', '1190', '1200',
  '1210', '1220', '1230',
]

// Niederösterreich: Bezirke
const NOE_DISTRICTS = [
  'Baden', 'Bruck an der Leitha', 'Gänserndorf', 'Gmünd',
  'Hollabrunn', 'Horn', 'Korneuburg', 'Krems', 'Lilienfeld',
  'Melk', 'Mistelbach', 'Mödling', 'Neunkirchen', 'Pöchlarn',
  'Sankt Pölten', 'Scheibbs', 'Tulln', 'Waidhofen an der Thaya',
  'Waidhofen an der Ybbs', 'Wiener Neustadt', 'Zwettl',
]

export function buildSearchMatrix(options?: {
  categoriesSubset?: string[]
  wienOnly?: boolean
  noeOnly?: boolean
  maxPerRegion?: number
}): SearchEntry[] {
  const cats = options?.categoriesSubset ?? CATEGORIES
  const entries: SearchEntry[] = []

  if (!options?.noeOnly) {
    for (const district of WIEN_DISTRICTS) {
      for (const cat of cats) {
        entries.push({
          query: `${cat} Wien ${district}`,
          region: `Wien ${district}`,
          federalState: 'Wien',
        })
      }
    }
  }

  if (!options?.wienOnly) {
    for (const bezirk of NOE_DISTRICTS) {
      for (const cat of cats) {
        entries.push({
          query: `${cat} ${bezirk} Niederösterreich`,
          region: bezirk,
          federalState: 'Niederösterreich',
        })
      }
    }
  }

  if (options?.maxPerRegion) {
    // Limit: nehme nur die ersten N Kategorien pro Region
    const seen = new Map<string, number>()
    return entries.filter((e) => {
      const count = seen.get(e.region) ?? 0
      if (count >= (options.maxPerRegion ?? 99)) return false
      seen.set(e.region, count + 1)
      return true
    })
  }

  return entries
}
