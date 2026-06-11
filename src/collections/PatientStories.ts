import type { CollectionConfig } from 'payload'

export const PatientStories: CollectionConfig = {
  slug: 'patient-stories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'storyType', 'status', 'publishedAt'],
    group: 'Seltene Erkrankungen',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel des Erfahrungsberichts',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'storyType',
      type: 'select',
      label: 'Perspektive',
      required: true,
      options: [
        { label: 'Patient:in', value: 'patient' },
        { label: 'Angehörige:r', value: 'relative' },
        { label: 'Ärzt:in / Fachperson', value: 'expert' },
        { label: 'Pflegeperson', value: 'caregiver' },
      ],
    },
    {
      name: 'isAnonymous',
      type: 'checkbox',
      label: 'Anonym veröffentlichen',
      defaultValue: false,
    },
    {
      name: 'authorDisplayName',
      type: 'text',
      label: 'Anzeigename (oder Pseudonym)',
      admin: {
        description: 'Wird angezeigt wenn nicht anonym. Bei anonymen Berichten leer lassen.',
      },
    },
    {
      name: 'disease',
      type: 'relationship',
      label: 'Erkrankung',
      relationTo: 'diseases',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Erfahrungsbericht',
      localized: true,
    },
    {
      name: 'editorialNote',
      type: 'textarea',
      label: 'Redaktioneller Hinweis',
      localized: true,
      admin: {
        description: 'Sichtbarer Disclaimer unter dem Bericht, z.B. "Dieser Bericht gibt persönliche Erfahrungen wieder und ersetzt keine ärztliche Beratung."',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlichungsdatum',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Entwurf', value: 'draft' },
        { label: 'In Prüfung', value: 'review' },
        { label: 'Veröffentlicht', value: 'published' },
      ],
      defaultValue: 'draft',
    },
  ],
}
