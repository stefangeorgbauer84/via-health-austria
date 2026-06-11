import type { CollectionConfig } from 'payload'

export const ExpertCenters: CollectionConfig = {
  slug: 'expert-centers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'centerType', 'country', 'verified', 'updatedAt'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name des Zentrums',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'centerType',
      type: 'select',
      label: 'Zentrumstyp',
      options: [
        { label: 'European Reference Network (ERN)', value: 'ern' },
        { label: 'Nationales Referenzzentrum', value: 'national_ref' },
        { label: 'Universitätsklinik / Spezialabteilung', value: 'university' },
        { label: 'Ambulanz / Spezialambulanz', value: 'outpatient' },
        { label: 'Selbsthilfezentrum', value: 'selfhelp' },
      ],
    },
    {
      name: 'ernNetwork',
      type: 'text',
      label: 'ERN-Netzwerk',
      admin: {
        description: 'z.B. ERN-EURO-NMD, ERN-RARE-LIVER, MetabERN',
        condition: (data) => data.centerType === 'ern',
      },
    },
    {
      name: 'country',
      type: 'select',
      label: 'Land',
      options: [
        { label: 'Österreich', value: 'at' },
        { label: 'Deutschland', value: 'de' },
        { label: 'Schweiz', value: 'ch' },
        { label: 'Sonstiges EU-Land', value: 'eu_other' },
      ],
      defaultValue: 'at',
    },
    {
      name: 'city',
      type: 'text',
      label: 'Stadt',
    },
    {
      name: 'address',
      type: 'text',
      label: 'Adresse',
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Kontakt-E-Mail',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      localized: true,
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: 'Von WohinMedizin verifiziert',
      defaultValue: false,
    },
  ],
}
