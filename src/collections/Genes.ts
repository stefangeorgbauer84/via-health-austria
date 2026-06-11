import type { CollectionConfig } from 'payload'

export const Genes: CollectionConfig = {
  slug: 'genes',
  admin: {
    useAsTitle: 'symbol',
    defaultColumns: ['symbol', 'fullName', 'chromosome', 'updatedAt'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'symbol',
      type: 'text',
      label: 'Gensymbol (z.B. DMD)',
      required: true,
      unique: true,
    },
    {
      name: 'fullName',
      type: 'text',
      label: 'Vollständiger Genname',
    },
    {
      name: 'ncbiId',
      type: 'text',
      label: 'NCBI Gene ID',
      admin: {
        description: 'Numerische ID aus der NCBI Gene-Datenbank',
      },
    },
    {
      name: 'omimId',
      type: 'text',
      label: 'OMIM ID',
    },
    {
      name: 'chromosome',
      type: 'text',
      label: 'Chromosom',
      admin: {
        description: 'z.B. Xp21.2',
      },
    },
    {
      name: 'inheritancePattern',
      type: 'select',
      label: 'Vererbungsmuster',
      options: [
        { label: 'Autosomal-dominant', value: 'autosomal_dominant' },
        { label: 'Autosomal-rezessiv', value: 'autosomal_recessive' },
        { label: 'X-chromosomal-dominant', value: 'x_dominant' },
        { label: 'X-chromosomal-rezessiv', value: 'x_recessive' },
        { label: 'Mitochondrial', value: 'mitochondrial' },
        { label: 'Multifaktoriell', value: 'multifactorial' },
        { label: 'Unbekannt', value: 'unknown' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung (patientenverständlich)',
      localized: true,
    },
  ],
}
