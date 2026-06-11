export type EntityType =
  | 'einzelordination'
  | 'gruppenpraxis'
  | 'gesundheitszentrum'
  | 'pvz'
  | 'ambulatorium'
  | 'zahnarzt'
  | 'physiotherapie'
  | 'psychotherapie'
  | 'sonstige'

export type ComplianceClass = 'A' | 'B' | 'C' | 'D'

export interface RawApifyResult {
  title?: string
  subTitle?: string
  price?: string
  categoryName?: string
  categories?: string[]
  address?: string
  street?: string
  city?: string
  postalCode?: string
  state?: string
  countryCode?: string
  website?: string
  phone?: string
  phoneUnformatted?: string
  location?: { lat: number; lng: number }
  placeId?: string
  cid?: string
  url?: string
  totalScore?: number
  reviewsCount?: number
  permanentlyClosed?: boolean
  temporarilyClosed?: boolean
  openingHours?: Array<{ day: string; hours: string }>
}

export interface CleanedEntity {
  canonical_name: string
  entity_type: EntityType | null
  primary_category: string | null
  secondary_categories: string[]
  address_line: string | null
  postal_code: string | null
  city: string | null
  federal_state: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  website: string | null
  is_natural_person: boolean
  compliance_class: ComplianceClass
}

export interface SourceRecord {
  source_type: 'apify_google_maps'
  source_name: string
  google_place_id: string | null
  google_maps_url: string | null
  raw_name: string | null
  raw_address: string | null
  raw_phone: string | null
  raw_website: string | null
  rating: number | null
  review_count: number | null
  retrieved_at: string
  search_query: string
  run_id: string
}
