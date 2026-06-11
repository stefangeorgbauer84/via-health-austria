import type { CollectionConfig } from 'payload'

export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'hpoCode', 'category', 'updatedAt'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Symptombezeichnung',
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
      name: 'hpoCode',
      type: 'text',
      label: 'HPO-Code (Human Phenotype Ontology)',
      admin: {
        description: 'z.B. HP:0001250',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Häufigkeit als Symptom',
      options: [
        { label: 'Sehr häufig (>80% der Betroffenen)', value: 'very_common' },
        { label: 'Häufig (30–80%)', value: 'common' },
        { label: 'Gelegentlich (5–29%)', value: 'occasional' },
        { label: 'Selten (<5%)', value: 'rare' },
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
