import type { CollectionConfig } from 'payload'

export const Sources: CollectionConfig = {
  slug: 'sources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sourceType', 'license', 'accessedAt'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel / Bezeichnung',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
    },
    {
      name: 'sourceType',
      type: 'select',
      label: 'Quellentyp',
      required: true,
      options: [
        { label: 'Orphadata', value: 'orphadata' },
        { label: 'ORPHAcodes', value: 'orphacodes' },
        { label: 'GARD (NIH)', value: 'gard' },
        { label: 'MedlinePlus Genetics', value: 'medlineplus' },
        { label: 'NORD', value: 'nord' },
        { label: 'PubMed', value: 'pubmed' },
        { label: 'European Reference Network (ERN)', value: 'ern' },
        { label: 'EURORDIS', value: 'eurordis' },
        { label: 'Patient:innenorganisation', value: 'patient_org' },
        { label: 'Fachgesellschaft / Leitlinie', value: 'guideline' },
        { label: 'Sonstige', value: 'other' },
      ],
    },
    {
      name: 'license',
      type: 'select',
      label: 'Lizenz',
      options: [
        { label: 'CC BY 4.0', value: 'cc_by_4' },
        { label: 'CC BY-NC 4.0', value: 'cc_by_nc_4' },
        { label: 'CC BY-SA 4.0', value: 'cc_by_sa_4' },
        { label: 'Public Domain / CC0', value: 'public_domain' },
        { label: 'Alle Rechte vorbehalten', value: 'all_rights_reserved' },
        { label: 'Nutzung geprüft und dokumentiert', value: 'checked' },
        { label: 'Unbekannt — zu klären', value: 'unknown' },
      ],
    },
    {
      name: 'authorOrOrganization',
      type: 'text',
      label: 'Autor:in / Organisation',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlichungsdatum',
    },
    {
      name: 'accessedAt',
      type: 'date',
      label: 'Abgerufen am',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Interne Notizen zur Lizenz / Attribution',
      admin: {
        description: 'Für interne Dokumentation. Wird nicht veröffentlicht.',
      },
    },
  ],
}
