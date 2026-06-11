import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { de } from '@payloadcms/translations/languages/de'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/collections/Users'
import { Articles } from './src/collections/Articles'
import { Specialties } from './src/collections/Specialties'
import { DoctorProfiles } from './src/collections/DoctorProfiles'
import { Media } from './src/collections/Media'
import { Diseases } from './src/collections/Diseases'
import { Symptoms } from './src/collections/Symptoms'
import { Genes } from './src/collections/Genes'
import { Sources } from './src/collections/Sources'
import { ExpertReviews } from './src/collections/ExpertReviews'
import { PatientOrganizations } from './src/collections/PatientOrganizations'
import { ExpertCenters } from './src/collections/ExpertCenters'
import { PatientStories } from './src/collections/PatientStories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— WohinMedizin.at',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [
    Users,
    Articles,
    Specialties,
    DoctorProfiles,
    Media,
    // Seltene Erkrankungen
    Diseases,
    Symptoms,
    Genes,
    Sources,
    ExpertReviews,
    PatientOrganizations,
    ExpertCenters,
    PatientStories,
  ],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    // Verhindert dass Drizzle hc_* Tabellen (alter Scraper) mit Payload-Tabellen verwechselt
    tablesFilter: ['!hc_entities', '!hc_compliance_flags', '!hc_entity_sources', '!hc_scraping_runs'],
  }),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  localization: {
    locales: [
      { label: 'Deutsch', code: 'de' },
      { label: 'English', code: 'en' },
      { label: 'Türkçe', code: 'tr' },
      { label: 'BKS', code: 'bs' },
      { label: 'Arabisch', code: 'ar' },
      { label: 'Română', code: 'ro' },
      { label: 'Polski', code: 'pl' },
      { label: 'Русский', code: 'ru' },
      { label: 'Українська', code: 'uk' },
    ],
    defaultLocale: 'de',
    fallback: true,
  },

  i18n: {
    supportedLanguages: { de, en },
  },
})
