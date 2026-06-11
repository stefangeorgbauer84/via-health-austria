import type { CollectionConfig } from 'payload'

export const PatientOrganizations: CollectionConfig = {
  slug: 'patient-organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'verified', 'updatedAt'],
    group: 'Seltene Erkrankungen',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name der Organisation',
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
      name: 'country',
      type: 'select',
      label: 'Land',
      options: [
        { label: 'Österreich', value: 'at' },
        { label: 'Deutschland', value: 'de' },
        { label: 'Schweiz', value: 'ch' },
        { label: 'Europa (übergreifend)', value: 'eu' },
        { label: 'International', value: 'intl' },
      ],
      defaultValue: 'at',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      localized: true,
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
      name: 'eurordisAffiliated',
      type: 'checkbox',
      label: 'EURORDIS-Mitglied',
      defaultValue: false,
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: 'Von WohinMedizin verifiziert',
      defaultValue: false,
    },
  ],
}
