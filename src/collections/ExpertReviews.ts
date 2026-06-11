import type { CollectionConfig } from 'payload'

export const ExpertReviews: CollectionConfig = {
  slug: 'expert-reviews',
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['reviewerName', 'reviewerTitle', 'reviewedAt', 'approved'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'reviewerName',
      type: 'text',
      label: 'Name der prüfenden Person',
      required: true,
    },
    {
      name: 'reviewerTitle',
      type: 'text',
      label: 'Titel / Qualifikation',
      admin: {
        description: 'z.B. Fachärztin für Neurologie, MSc Rare Diseases',
      },
    },
    {
      name: 'reviewerInstitution',
      type: 'text',
      label: 'Institution / Klinik',
    },
    {
      name: 'reviewType',
      type: 'select',
      label: 'Art der Prüfung',
      options: [
        { label: 'Medizinisch-fachliche Prüfung', value: 'medical' },
        { label: 'Patient:innenperspektive', value: 'patient' },
        { label: 'Redaktionelle Prüfung', value: 'editorial' },
        { label: 'Juristische Prüfung', value: 'legal' },
      ],
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Prüfungsdatum',
      required: true,
    },
    {
      name: 'nextReviewDue',
      type: 'date',
      label: 'Nächste Überprüfung fällig',
      admin: {
        description: 'Empfehlung: 12 Monate nach letzter Prüfung',
      },
    },
    {
      name: 'approved',
      type: 'checkbox',
      label: 'Geprüft und freigegeben',
      defaultValue: false,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Prüfnotizen (intern)',
      admin: {
        description: 'Wird nicht veröffentlicht.',
      },
    },
  ],
}
