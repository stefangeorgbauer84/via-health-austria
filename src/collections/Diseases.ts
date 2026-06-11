/**
 * Diseases — Mehrstufige Multi-Axiale Krankheitstypologie
 *
 * Architektur nach ICD-11 / SNOMED CT / DSM-5-TR:
 *   Ebene 1  — Primäre Ätiologie (Hauptkategorie)
 *   Ebene 2  — Pathobiologischer Mechanismus (Subkategorie)
 *   Ebene 3  — Organsystem (Subsubkategorie, polyhierarchisch wie SNOMED CT)
 *   Mod. A   — Verlauf (akut / subakut / chronisch / rezidivierend)
 *   Mod. B   — Schweregrad (Spektrum, krankheitsspezifisch zu operationalisieren)
 *   Mod. C   — Komorbidität & Risikofaktoren (eigene Achse, nicht in Ätiologie gemischt)
 *   Mod. D   — Diagnostische Leitmodalitäten (Klinik / Labor / Bildgebung / Genetik)
 *
 * Terminologie-Layer: ORPHA, ICD-11 (Stem + Extension Codes), SNOMED CT, DSM-5-TR, OMIM, HPO
 */

import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'

const autoTimestampHook: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const prev = originalDoc?.status
  const next = data?.status
  if (next === 'published' && prev !== 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  if ((next === 'medical_review' || next === 'editorial_review') && prev === 'draft') {
    data.submittedForReviewAt = new Date().toISOString()
  }
  return data
}

export const Diseases: CollectionConfig = {
  slug: 'diseases',
  hooks: {
    beforeChange: [autoTimestampHook],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'reviewedAt', 'publishedAt'],
    group: 'Seltene Erkrankungen',
    description:
      'Krankheitsprofile nach 7-Ebenen-Multi-Axial-Typologie (ICD-11 / SNOMED CT / DSM-5-TR). Ein Profil kann mehrere Organsysteme gleichzeitig betreffen (polyhierarchisch).',
  },
  versions: {
    drafts: true,
  },
  fields: [
    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 1: IDENTIFIKATION
    // ─────────────────────────────────────────────────────────
    {
      name: 'name',
      type: 'text',
      label: 'Krankheitsname',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (URL)',
      required: true,
      unique: true,
      admin: {
        description: 'z.B. duchenne-muskeldystrophie',
      },
    },
    {
      name: 'aliases',
      type: 'array',
      label: 'Synonyme / Alternative Bezeichnungen',
      admin: {
        description:
          'Alle anderen Namen, unter denen die Erkrankung bekannt ist — verbessert Suchbarkeit und entspricht der ORPHA-Synonymlogik.',
      },
      fields: [
        {
          name: 'alias',
          type: 'text',
          label: 'Synonym',
          required: true,
        },
        {
          name: 'language',
          type: 'select',
          label: 'Sprache des Synonyms',
          options: [
            { label: 'Deutsch', value: 'de' },
            { label: 'Englisch', value: 'en' },
            { label: 'Lateinisch / Fachbegriff', value: 'lat' },
            { label: 'Sonstige', value: 'other' },
          ],
          defaultValue: 'de',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 2: MULTI-AXIALE KLASSIFIKATION
    // ─────────────────────────────────────────────────────────

    // --- EBENE 1: Primäre Ätiologie (Hauptkategorie) ---
    {
      name: 'primaryEtiology',
      type: 'select',
      label: 'Ebene 1 — Primäre Ätiologie',
      required: true,
      admin: {
        description:
          'Dominanter Entstehungsmechanismus. Bestimmt die Hauptkategorie der Erkrankung. Hinweis: Eine Erkrankung kann mehrere Mechanismen haben; hier wird der primär dominante gewählt.',
      },
      options: [
        {
          label: 'Infektiös — exogener biologischer Erreger',
          value: 'infectious',
        },
        {
          label: 'Genetisch — pathogene Variante, Chromosomenaberration oder erbliche molekulare Fehlfunktion',
          value: 'genetic',
        },
        {
          label: 'Autoimmun — fehlgeleitete Immunantwort gegen körpereigene Strukturen',
          value: 'autoimmune',
        },
        {
          label: 'Metabolisch — Störung von Stoffwechselwegen, Hormonregulation oder Energie-/Substrathaushalt',
          value: 'metabolic',
        },
        {
          label: 'Neoplastisch — autonome klonale Zellproliferation mit neoplastischer Morphologie',
          value: 'neoplastic',
        },
        {
          label: 'Traumatisch — äußere physische Gewalteinwirkung oder Unfallmechanismus',
          value: 'traumatic',
        },
        {
          label: 'Psychisch / Neurobehavioral — primär psychischer oder neurobehavioraler Symptomkomplex',
          value: 'psychiatric',
        },
        {
          label: 'Degenerativ — fortschreitender Struktur- oder Funktionsverlust ohne primär anderen Hauptmechanismus',
          value: 'degenerative',
        },
        {
          label: 'Iatrogen — primär auf medizinische Intervention, Arzneimittel, Gerät oder Behandlungsprozess zurückzuführen',
          value: 'iatrogenic',
        },
        {
          label: 'Multifaktoriell / Komplex — kein einzelner dominanter Mechanismus identifizierbar',
          value: 'multifactorial',
        },
        {
          label: 'Unbekannt / Nicht klassifiziert',
          value: 'unknown',
        },
      ],
    },

    // --- EBENE 2: Pathobiologischer Mechanismus (Subkategorie) ---
    {
      name: 'mechanismSubtype',
      type: 'select',
      label: 'Ebene 2 — Pathobiologischer Mechanismus (Subkategorie)',
      admin: {
        description:
          'Präzisiert den Entstehungsmechanismus innerhalb der Hauptkategorie. Optionen entsprechen den ICD-11 Finer Categories und SNOMED-Postkoordinations-Konzepten.',
      },
      options: [
        // Infektiös
        { label: 'Viral', value: 'viral' },
        { label: 'Bakteriell', value: 'bacterial' },
        { label: 'Mykotisch (Pilzbedingt)', value: 'fungal' },
        { label: 'Parasitär', value: 'parasitic' },
        { label: 'Prionbedingt', value: 'prion' },
        // Genetisch
        { label: 'Monogen', value: 'monogenic' },
        { label: 'Chromosomal / Aneuploidie', value: 'chromosomal' },
        { label: 'Mitochondrial', value: 'mitochondrial' },
        { label: 'Multifaktoriell-erblich', value: 'multifactorial_hereditary' },
        { label: 'De-novo-Mutation', value: 'de_novo' },
        // Autoimmun
        { label: 'Organspezifisch autoimmun', value: 'organ_specific_autoimmune' },
        { label: 'Systemisch autoimmun', value: 'systemic_autoimmune' },
        { label: 'Immunvermittelt (nicht klassisch autoimmun)', value: 'immune_mediated' },
        // Metabolisch
        { label: 'Endokrin / Hormonstörung', value: 'endocrine' },
        { label: 'Nutritiv / Mangelernährung', value: 'nutritional' },
        { label: 'Toxisch-metabolisch', value: 'toxic_metabolic' },
        { label: 'Enzymdefekt', value: 'enzyme_defect' },
        { label: 'Speicherkrankheit', value: 'storage_disease' },
        // Neoplastisch
        { label: 'Solider Tumor', value: 'solid_tumor' },
        { label: 'Hämatologische Neoplasie', value: 'hematologic_neoplasm' },
        { label: 'Benigne Neoplasie', value: 'benign_neoplasm' },
        { label: 'Carcinoma in situ', value: 'in_situ' },
        // Traumatisch
        { label: 'Stumpfes Trauma', value: 'blunt_trauma' },
        { label: 'Penetrierendes Trauma', value: 'penetrating_trauma' },
        { label: 'Thermisches Trauma', value: 'thermal_trauma' },
        { label: 'Chemisches Trauma', value: 'chemical_trauma' },
        { label: 'Mechanisch / Überlastung', value: 'mechanical' },
        // Psychisch
        { label: 'Neuroentwicklungsbedingt', value: 'neurodevelopmental' },
        { label: 'Psychotisch', value: 'psychotic' },
        { label: 'Affektiv', value: 'affective' },
        { label: 'Angst / Zwang', value: 'anxiety_ocd' },
        { label: 'Trauma / Stressbedingt', value: 'trauma_stress' },
        { label: 'Substanzgebrauch / Sucht', value: 'substance_use' },
        { label: 'Persönlichkeit', value: 'personality' },
        { label: 'Neurokognitiv / Demenz', value: 'neurocognitive' },
        // Degenerativ
        { label: 'Neurodegenerativ', value: 'neurodegenerative' },
        { label: 'Muskuloskeletal-degenerativ', value: 'musculoskeletal_degenerative' },
        { label: 'Altersassoziierte Organentartung', value: 'age_related_organ_degeneration' },
        // Iatrogen
        { label: 'Arzneimittelinduziert', value: 'drug_induced' },
        { label: 'Prozedurbedingt', value: 'procedure_related' },
        { label: 'Geräteassoziiert', value: 'device_related' },
        { label: 'Behandlungsassoziiert (sonstige)', value: 'treatment_related' },
      ],
    },
    {
      name: 'mechanismNote',
      type: 'textarea',
      label: 'Mechanismus — Erläuterung',
      localized: true,
      admin: {
        description:
          'Freitext-Präzisierung des Mechanismus, z.B. spezifischer Gendefekt, Erreger, Antikörpertyp. Für redaktionelle Nutzung im Artikel.',
      },
    },

    // --- EBENE 3: Organsystem (Subsubkategorie, polyhierarchisch) ---
    {
      name: 'organSystems',
      type: 'select',
      label: 'Ebene 3 — Betroffene Organsysteme (polyhierarchisch)',
      hasMany: true,
      required: true,
      admin: {
        description:
          'Kann mehrere Systeme gleichzeitig enthalten — polyhierarchisch wie SNOMED CT (Finding site). Lupus z.B. ist gleichzeitig neurologisch, hämatologisch und dermatologisch. Kein erzwungener Mono-Slot.',
      },
      options: [
        {
          label: 'Kardiovaskulär — ICD-11 Kap. 11 (Diseases of the circulatory system)',
          value: 'cardiovascular',
        },
        {
          label: 'Respiratorisch — ICD-11 Kap. 12 (Diseases of the respiratory system)',
          value: 'respiratory',
        },
        {
          label: 'Neurologisch — ICD-11 Kap. 08 (Diseases of the nervous system)',
          value: 'neurological',
        },
        {
          label: 'Psychiatrisch / Neurobehavioral — ICD-11 Kap. 06',
          value: 'psychiatric',
        },
        {
          label: 'Gastrointestinal — ICD-11 Kap. 13 (Diseases of the digestive system)',
          value: 'gastrointestinal',
        },
        {
          label: 'Endokrin / Metabolisch — ICD-11 Kap. 05',
          value: 'endocrine_metabolic',
        },
        {
          label: 'Muskuloskeletal — ICD-11 Kap. 15 (Musculoskeletal system or connective tissue)',
          value: 'musculoskeletal',
        },
        {
          label: 'Dermatologisch — ICD-11 Kap. 14 (Diseases of the skin)',
          value: 'dermatological',
        },
        {
          label: 'Urogenital / Nephrologisch — ICD-11 Kap. 16 (Diseases of the genitourinary system)',
          value: 'urogenital',
        },
        {
          label: 'Hämatologisch / Immunologisch — ICD-11 Kap. 03 / 04',
          value: 'hematological_immunological',
        },
        {
          label: 'Visuelles System — ICD-11 Kap. 09 (Diseases of the visual system)',
          value: 'visual',
        },
        {
          label: 'Gehör / Mastoid — ICD-11 Kap. 10 (Diseases of the ear or mastoid process)',
          value: 'auditory',
        },
        {
          label: 'Reproduktionssystem — ICD-11 Kap. 17',
          value: 'reproductive',
        },
        {
          label: 'Neonatologisch / Pädiatrisch — ICD-11 Kap. 19 / 20',
          value: 'pediatric_neonatal',
        },
        {
          label: 'Multisystemisch — mehrere Systeme ohne klare Dominanz',
          value: 'multisystemic',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // MODIFIKATOREN A–D
    // ─────────────────────────────────────────────────────────

    {
      name: 'modifiers',
      type: 'group',
      label: 'Modifikatoren (Verlauf · Schweregrad · Komorbidität · Diagnostik)',
      admin: {
        description:
          'Die vier Achsen zur vollständigen Beschreibung des klinischen Bildes. Entspricht der ICD-11 Extension-Code-Logik, SNOMED Qualifier Values und DSM-5-TR Spezifizierern.',
      },
      fields: [
        // Modifikator A: Verlauf
        {
          name: 'courseModifier',
          type: 'select',
          label: 'Mod. A — Verlauf (Zeitachse)',
          admin: {
            description:
              'Die konkreten Grenzwerte (z.B. "chronisch ≥ 3 Monate") sind krankheitsspezifisch zu operationalisieren — bitte im Freitextfeld unten präzisieren. Entspricht ICD-11 Timing/Context-Extensions, SNOMED Qualifier Values und DSM-5-TR Episode/Course Specifiers.',
          },
          options: [
            {
              label: 'Akut — plötzlicher Beginn und/oder kurze Dauer',
              value: 'acute',
            },
            {
              label: 'Subakut — klinische Zwischenphase, weder fulminant-akut noch etabliert chronisch',
              value: 'subacute',
            },
            {
              label: 'Chronisch — langandauernd, persistierend oder dauerhaft kontrollbedürftig',
              value: 'chronic',
            },
            {
              label: 'Rezidivierend — Wiederauftreten nach Besserung oder Remission',
              value: 'recurrent',
            },
            {
              label: 'Episodisch — klar abgegrenzte Episoden ohne vollständige Remission dazwischen',
              value: 'episodic',
            },
            {
              label: 'Variabel / krankheitsspezifisch — bitte im Freitextfeld beschreiben',
              value: 'variable',
            },
          ],
        },
        {
          name: 'courseNote',
          type: 'textarea',
          label: 'Verlauf — Krankheitsspezifische Operationalisierung',
          localized: true,
          admin: {
            description:
              'z.B. "Chronisch bedeutet bei dieser Erkrankung >6 Monate" oder "Remission nach Therapie möglich, Rezidivrate ca. 30%".',
          },
        },

        // Modifikator B: Schweregrad
        {
          name: 'severitySpectrum',
          type: 'select',
          label: 'Mod. B — Schweregradspektrum (typisch für diese Erkrankung)',
          hasMany: true,
          admin: {
            description:
              'Mehrfachauswahl erlaubt — das Spektrum, das diese Erkrankung typischerweise abdeckt. Entspricht ICD-11 Extension Codes, DSM Severity Specifiers, NCI-CTCAE-Logik (mild/moderat/schwer/lebensbedrohlich). Immer durch krankheitsspezifische Skalen im Freitextfeld ergänzen.',
          },
          options: [
            {
              label: 'Leicht — milde Symptome, geringe funktionelle Einschränkung, meist ambulant führbar',
              value: 'mild',
            },
            {
              label: 'Moderat — relevante Einschränkung, kein unmittelbares Todesrisiko, enges Monitoring',
              value: 'moderate',
            },
            {
              label: 'Schwer — deutliche funktionelle / organbezogene Beeinträchtigung, häufig Hospitalisierung',
              value: 'severe',
            },
            {
              label: 'Lebensbedrohlich — unmittelbares Todesrisiko oder dringende Intervention erforderlich',
              value: 'life_threatening',
            },
          ],
        },
        {
          name: 'severityClinicalScale',
          type: 'text',
          label: 'Verwendete Fachskala(en) für Schweregrad',
          admin: {
            description:
              'z.B. NYHA für Herzinsuffizienz, GOLD für COPD, KDIGO für Nierenerkrankungen, EDSS für Multiple Sklerose, CDAI für Morbus Crohn.',
          },
        },
        {
          name: 'severityNote',
          type: 'textarea',
          label: 'Schweregrad — Erläuterung',
          localized: true,
        },

        // Modifikator C: Komorbidität & Risikofaktoren
        {
          name: 'riskFactorCategories',
          type: 'select',
          label: 'Mod. C — Risikofaktorkategorien (ICD-11 Kap. 24)',
          hasMany: true,
          admin: {
            description:
              'Relevante Risikofaktorkategorien nach ICD-11 Kap. 24 "Factors influencing health status or contact with health services". Risikofaktoren sind eigene Achse — nicht in die Ätiologie hineingemengt. Entspricht WHO Multimorbidität-Konzept (≥2 chronische Erkrankungen) und DSM-5-TR Risk/Prognostic-Factors-Modulen.',
          },
          options: [
            { label: 'Genetische Prädisposition / Familienanamnese', value: 'genetic_predisposition' },
            { label: 'Tabakkonsum / Rauchen', value: 'smoking' },
            { label: 'Adipositas / Übergewicht', value: 'obesity' },
            { label: 'Arterielle Hypertonie', value: 'hypertension' },
            { label: 'Diabetes mellitus', value: 'diabetes' },
            { label: 'Immunsuppression / Immundefekt', value: 'immunosuppression' },
            { label: 'Umwelt-/Berufsexposition (Toxine, Strahlung)', value: 'environmental_exposure' },
            { label: 'Psychosoziale Belastung', value: 'psychosocial_stress' },
            { label: 'Höheres Lebensalter', value: 'advanced_age' },
            { label: 'Geschlecht (biologisch)', value: 'biological_sex' },
            { label: 'Chronische Komedikation', value: 'chronic_medication' },
            { label: 'Vorherige Erkrankung als Risikofaktor', value: 'prior_disease' },
            { label: 'Sozioökonomische Faktoren', value: 'socioeconomic' },
            { label: 'Migrationsbiographie / Herkunftsregion', value: 'migration_origin' },
          ],
        },
        {
          name: 'comorbiditiesContext',
          type: 'richText',
          label: 'Komorbidität & Multimorbidität — Beschreibung',
          localized: true,
          admin: {
            description:
              'Bekannte Komorbiditäten und ihr klinischer Kontext. Multimorbidität = gleichzeitiges Vorliegen von ≥2 chronischen Erkrankungen (WHO/NICE-Definition). Trennung zwischen Indexdiagnose und Komorbidität sauber halten.',
          },
        },

        // Modifikator D: Diagnostische Leitmodalitäten
        {
          name: 'diagnosticModalities',
          type: 'select',
          label: 'Mod. D — Diagnostische Leitmodalitäten',
          hasMany: true,
          required: true,
          admin: {
            description:
              'Typische diagnostische Hauptwege für diese Erkrankung. Mehrfachauswahl möglich. Entspricht dem SNOMED-Konzept "bevorzugter Evidenzpfad" — jede Erkrankung sollte mindestens eine Leitmodalität haben.',
          },
          options: [
            {
              label: 'Klinik — Anamnese, körperlicher Status, Symptomcluster, Verlauf',
              value: 'clinical',
            },
            {
              label: 'Labor — Blut, Urin, Liquor, Mikrobiologie, Biomarker, Immunserologie',
              value: 'laboratory',
            },
            {
              label: 'Bildgebung — Radiologie, MRT, CT, Ultraschall, Nuklearmedizin',
              value: 'imaging',
            },
            {
              label: 'Genetik — DNA/RNA-Testung, Chromosomenanalyse, Variantennachweis, Paneldiagnostik',
              value: 'genetics',
            },
            {
              label: 'Histologie / Pathologie — Biopsie, Gewebsuntersuchung',
              value: 'histology',
            },
            {
              label: 'Neurophysiologie — EEG, EMG, NLG, evozierte Potenziale',
              value: 'neurophysiology',
            },
            {
              label: 'Funktionsdiagnostik — Lungenfunktion, Echokardiographie, Audiometrie',
              value: 'functional_diagnostics',
            },
            {
              label: 'Psychiatrische Diagnostik — strukturiertes Interview, Testbatterien, ICD/DSM-Kriterien',
              value: 'psychiatric_assessment',
            },
          ],
        },
        {
          name: 'diagnosticNote',
          type: 'textarea',
          label: 'Diagnostik — Erläuterung (patientenverständlich)',
          localized: true,
          admin: {
            description:
              'Kurze Erklärung für Betroffene: Welche Untersuchungen sind typisch? Warum? Wie lange dauert die Diagnose durchschnittlich? Welche Differenzialdiagnosen gibt es?',
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 3: TERMINOLOGISCHE CODES
    // ICD-11 (Stem + Extension), SNOMED CT, DSM-5-TR, ORPHA, OMIM, HPO
    // ─────────────────────────────────────────────────────────
    {
      name: 'codes',
      type: 'group',
      label: 'Terminologische Codes (ICD-11 · SNOMED CT · DSM-5-TR · ORPHA · OMIM · HPO)',
      admin: {
        description:
          'Vollständiger Terminologie-Layer für semantische Interoperabilität. ICD-11 für Reporting/Statistik, SNOMED CT für klinische EHR-Semantik, DSM-5-TR nur für psychische Erkrankungen, ORPHA für seltene Erkrankungen.',
      },
      fields: [
        // ORPHA
        {
          name: 'orphaCode',
          type: 'text',
          label: 'ORPHA-Code (Orphanet)',
          admin: {
            description: 'Eindeutige ID aus der Orphanet-Datenbank. Format: ORPHA:NNNNN, z.B. ORPHA:98896',
          },
        },

        // ICD-11
        {
          name: 'icd11StemCode',
          type: 'text',
          label: 'ICD-11 Stem Code (Primärkode für Reporting)',
          admin: {
            description:
              'Hauptkode aus der ICD-11 Linearisierung (MMS = Mortality and Morbidity Statistics). Für Statistik, Casemix, Berichtspflichten. Format: z.B. 8A40.0',
          },
        },
        {
          name: 'icd11ExtensionCodes',
          type: 'array',
          label: 'ICD-11 Extension Codes (Postkoordination)',
          admin: {
            description:
              'Ergänzende Codes zur Präzisierung (Schweregrad, Anatomie, Histopathologie, Kausalität, Timing). Entspricht der ICD-11 Cluster-Coding-Logik — mehrere Codes beschreiben erst gemeinsam den vollständigen klinischen Sachverhalt.',
          },
          fields: [
            {
              name: 'code',
              type: 'text',
              label: 'Extension Code',
              required: true,
            },
            {
              name: 'codeType',
              type: 'select',
              label: 'Art des Extension Codes',
              options: [
                { label: 'Schweregrad', value: 'severity' },
                { label: 'Anatomischer Ort', value: 'anatomy' },
                { label: 'Histopathologie', value: 'histopathology' },
                { label: 'Ätiologie / Kausalität', value: 'etiology' },
                { label: 'Timing / Verlauf', value: 'timing' },
                { label: 'Lateralität', value: 'laterality' },
                { label: 'Patient-Safety / Iatrogen', value: 'patient_safety' },
                { label: 'Sonstige', value: 'other' },
              ],
            },
            {
              name: 'note',
              type: 'text',
              label: 'Erläuterung',
            },
          ],
        },
        {
          name: 'icd11ChapterAnchor',
          type: 'text',
          label: 'ICD-11 Kapitelanker',
          admin: {
            description:
              'Kapitelbezeichnung aus der ICD-11 Foundation für Navigationslogik. z.B. "Kap. 08 Diseases of the nervous system" oder "Kap. 05 Endocrine, nutritional or metabolic diseases".',
          },
        },
        {
          name: 'icd10Code',
          type: 'text',
          label: 'ICD-10 Code (aktuell gültig in DACH)',
          admin: {
            description:
              'Deutschland/Österreich/Schweiz nutzen weiterhin ICD-10 (DE: ICD-10-GM, AT: ICD-10-WHO) — ICD-11 ist in DACH Stand 2026 noch nicht produktiv eingeführt.',
          },
        },

        // SNOMED CT
        {
          name: 'snomedConceptId',
          type: 'text',
          label: 'SNOMED CT Concept ID',
          admin: {
            description:
              'Eindeutige numerische SNOMED-CT-Konzept-ID für semantische EHR-Interoperabilität. Beispiel: COVID-19 = 840539006. Deutschland ist seit 2021 SNOMED-International-Mitglied; BfArM betreibt das National Release Center.',
          },
        },
        {
          name: 'snomedFSN',
          type: 'text',
          label: 'SNOMED CT Fully Specified Name (FSN)',
          admin: {
            description: 'Vollständiger eindeutiger SNOMED-Konzeptname auf Englisch, z.B. "Duchenne muscular dystrophy (disorder)".',
          },
        },

        // DSM-5-TR (nur für psychische Erkrankungen)
        {
          name: 'dsmCode',
          type: 'text',
          label: 'DSM-5-TR Code',
          admin: {
            description:
              'Nur bei psychischen Erkrankungen befüllen. DSM-5-TR-Codes sind ICD-10-CM-basiert und werden laufend aktualisiert. DSM-5-TR ergänzt Kriterien, Spezifizierer, Verlauf, Risiko- und Kulturfaktoren sowie Komorbidität.',
          },
        },
        {
          name: 'dsmChapter',
          type: 'select',
          label: 'DSM-5-TR Kapitel',
          admin: {
            description: 'Nur bei psychischen Erkrankungen relevant. DSM-5-TR hat 20 Störungskapitel.',
            condition: (data) => data?.primaryEtiology === 'psychiatric',
          },
          options: [
            { label: 'Neuroentwicklungsstörungen', value: 'neurodevelopmental' },
            { label: 'Schizophrenie-Spektrum und andere psychotische Störungen', value: 'schizophrenia_spectrum' },
            { label: 'Bipolare und verwandte Störungen', value: 'bipolar' },
            { label: 'Depressive Störungen', value: 'depressive' },
            { label: 'Angststörungen', value: 'anxiety' },
            { label: 'Zwangsstörungen und verwandte Störungen', value: 'ocd' },
            { label: 'Trauma- und stressbezogene Störungen', value: 'trauma_stress' },
            { label: 'Dissoziative Störungen', value: 'dissociative' },
            { label: 'Somatische Belastungsstörungen', value: 'somatic_symptom' },
            { label: 'Fütter- und Essstörungen', value: 'feeding_eating' },
            { label: 'Ausscheidungsstörungen', value: 'elimination' },
            { label: 'Schlaf-Wach-Störungen', value: 'sleep_wake' },
            { label: 'Sexuelle Dysfunktionen', value: 'sexual_dysfunctions' },
            { label: 'Gender-Dysphorie', value: 'gender_dysphoria' },
            { label: 'Störungen der Impulskontrolle und des Sozialverhaltens', value: 'disruptive_impulse_control' },
            { label: 'Substanzgebrauch und abhängige Störungen', value: 'substance_related' },
            { label: 'Neurokognitive Störungen', value: 'neurocognitive' },
            { label: 'Persönlichkeitsstörungen', value: 'personality' },
            { label: 'Paraphile Störungen', value: 'paraphilic' },
            { label: 'Andere psychische Störungen', value: 'other_mental' },
          ],
        },

        // OMIM & HPO
        {
          name: 'omimCode',
          type: 'text',
          label: 'OMIM-Code (Online Mendelian Inheritance in Man)',
          admin: {
            description: 'Numerische OMIM-ID. Besonders relevant für genetische Erkrankungen.',
          },
        },
        {
          name: 'hpoTerms',
          type: 'array',
          label: 'HPO-Terme (Human Phenotype Ontology)',
          admin: {
            description:
              'Standardisierte Phänotyp-IDs. Ergänzt die verknüpften Symptom-Datensätze mit maschinenlesbaren HPO-Codes für semantische Suche und Forschungsregister.',
          },
          fields: [
            {
              name: 'hpoId',
              type: 'text',
              label: 'HPO ID',
              required: true,
              admin: { description: 'Format: HP:NNNNNNN, z.B. HP:0001250' },
            },
            {
              name: 'hpoLabel',
              type: 'text',
              label: 'HPO Bezeichnung',
            },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 4: EPIDEMIOLOGIE & GENETIK
    // ─────────────────────────────────────────────────────────
    {
      name: 'epidemiology',
      type: 'group',
      label: 'Epidemiologie & Genetik',
      fields: [
        {
          name: 'prevalence',
          type: 'text',
          label: 'Prävalenz',
          admin: {
            description: 'z.B. "1 von 3.500 Neugeborenen" oder "<1:1.000.000". Quelle im Quellenfeld dokumentieren.',
          },
        },
        {
          name: 'prevalenceEU',
          type: 'number',
          label: 'Geschätzte Betroffene in der EU',
          admin: {
            description:
              'Schätzwert. Die EU nennt für Europa 27–36 Millionen Betroffene mit seltenen Erkrankungen (6.000–8.000 Erkrankungen gesamt).',
          },
        },
        {
          name: 'prevalenceAustria',
          type: 'text',
          label: 'Prävalenz / Schätzung Österreich',
        },
        {
          name: 'ageOfOnset',
          type: 'select',
          label: 'Typisches Erkrankungsalter',
          hasMany: true,
          options: [
            { label: 'Kongenital / Angeboren', value: 'congenital' },
            { label: 'Neugeborenenperiode (0–28 Tage)', value: 'neonatal' },
            { label: 'Säuglingsalter (1–12 Monate)', value: 'infancy' },
            { label: 'Kleinkind-/Kindesalter (1–11 Jahre)', value: 'childhood' },
            { label: 'Jugend (12–17 Jahre)', value: 'adolescence' },
            { label: 'Frühes Erwachsenenalter (18–39 Jahre)', value: 'young_adult' },
            { label: 'Mittleres Erwachsenenalter (40–65 Jahre)', value: 'middle_age' },
            { label: 'Ältere Erwachsene (>65 Jahre)', value: 'elderly' },
            { label: 'Alle Altersgruppen', value: 'all_ages' },
          ],
        },
        {
          name: 'sexDistribution',
          type: 'select',
          label: 'Geschlechtsverteilung',
          options: [
            { label: 'Gleichverteilt', value: 'equal' },
            { label: 'Überwiegt bei Männern / männlichem biologischem Geschlecht', value: 'male_predominant' },
            { label: 'Überwiegt bei Frauen / weiblichem biologischem Geschlecht', value: 'female_predominant' },
            { label: 'Nur / fast nur männlich (X-chromosomal rezessiv)', value: 'male_only' },
            { label: 'Unbekannt / nicht ausreichend untersucht', value: 'unknown' },
          ],
        },
        {
          name: 'inheritance',
          type: 'select',
          label: 'Vererbungsmuster',
          hasMany: true,
          admin: {
            description: 'Mehrfachauswahl möglich — manche Erkrankungen haben mehrere bekannte Vererbungsmuster.',
          },
          options: [
            { label: 'Autosomal-dominant', value: 'autosomal_dominant' },
            { label: 'Autosomal-rezessiv', value: 'autosomal_recessive' },
            { label: 'X-chromosomal-dominant', value: 'x_dominant' },
            { label: 'X-chromosomal-rezessiv', value: 'x_recessive' },
            { label: 'Mitochondrial', value: 'mitochondrial' },
            { label: 'Multifaktoriell / Polygenetisch', value: 'multifactorial' },
            { label: 'De-novo-Mutation', value: 'de_novo' },
            { label: 'Nicht genetisch', value: 'non_genetic' },
            { label: 'Unbekannt', value: 'unknown' },
          ],
        },
        {
          name: 'orphanDrugStatus',
          type: 'select',
          label: 'Orphan-Drug-Status (EU)',
          options: [
            { label: 'Kein zugelassenes Orphan Drug', value: 'none' },
            { label: 'Mindestens ein zugelassenes Orphan Drug (EMA)', value: 'approved' },
            { label: 'Orphan Designation vorhanden, noch nicht zugelassen', value: 'designated' },
            { label: 'Klinische Studien laufend', value: 'trials' },
            { label: 'Status unbekannt', value: 'unknown' },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 5: MEDIZINISCHER CONTENT (9-Punkte-Template)
    // ─────────────────────────────────────────────────────────
    {
      name: 'briefDescription',
      type: 'textarea',
      label: '1. Kurz erklärt (3–5 Sätze, patientenverständlich)',
      localized: true,
      required: true,
      admin: {
        description: 'Einleitungstext und SEO-Snippet. Klare, zugängliche Sprache. Kein Fachjargon ohne Erklärung.',
      },
    },
    {
      name: 'symptomsRelationship',
      type: 'relationship',
      label: '2. Symptome — strukturierte Verknüpfung (HPO-basiert)',
      relationTo: 'symptoms',
      hasMany: true,
      admin: {
        description: 'Verknüpft standardisierte Symptom-Datensätze mit HPO-Codes. Für maschinenlesbare Suche.',
      },
    },
    {
      name: 'symptomsDescription',
      type: 'richText',
      label: '2. Symptome — ausführliche patientenverständliche Beschreibung',
      localized: true,
      admin: {
        description: 'Häufige, gelegentliche und seltene Symptome klar trennen. Patientenverständlich formulieren.',
      },
    },
    {
      name: 'causesDescription',
      type: 'richText',
      label: '3. Ursachen',
      localized: true,
      admin: {
        description: 'Patientenverständliche Erklärung des Entstehungsmechanismus. Genetisch, autoimmun, metabolisch etc. — passend zu Ebene 1/2.',
      },
    },
    {
      name: 'genesRelationship',
      type: 'relationship',
      label: '3. Beteiligte Gene (strukturiert)',
      relationTo: 'genes',
      hasMany: true,
    },
    {
      name: 'diagnosisDescription',
      type: 'richText',
      label: '4. Diagnose — Wie wird die Erkrankung festgestellt?',
      localized: true,
      admin: {
        description:
          'Typische Untersuchungen, genetische Tests, Bildgebung, Biomarker, Differenzialdiagnosen, typische Diagnosedauer.',
      },
    },
    {
      name: 'diagnosisDelay',
      type: 'text',
      label: '4. Typische Diagnoseverzögerung',
      admin: {
        description: 'z.B. "Durchschnittlich 7 Jahre bis zur Diagnose (Orphanet-Daten)". Besonders relevant bei seltenen Erkrankungen.',
      },
    },
    {
      name: 'treatmentDescription',
      type: 'richText',
      label: '5. Behandlung und Betreuung',
      localized: true,
      admin: {
        description:
          'Verfügbare Therapieansätze — keine Heilversprechen. Symptomatische Therapie, krankheitsmodifizierende Therapie, Rehabilitation, Palliativversorgung unterscheiden.',
      },
    },
    {
      name: 'dailyLifeDescription',
      type: 'richText',
      label: '6. Leben mit der Erkrankung',
      localized: true,
      admin: {
        description: 'Alltag, Schule, Beruf, Familie, Partnerschaft, psychische Belastung, Sozialleistungen in Österreich.',
      },
    },
    {
      name: 'doctorQuestions',
      type: 'richText',
      label: '7. Fragen für das Arztgespräch',
      localized: true,
      admin: {
        description: 'Konkrete Fragen, die Betroffene beim nächsten Termin stellen können. Hoher praktischer Nutzen.',
      },
    },
    {
      name: 'disclaimer',
      type: 'textarea',
      label: '8. Medizinischer Haftungsausschluss',
      localized: true,
      defaultValue:
        'Diese Informationen dienen der allgemeinen Orientierung und ersetzen keine ärztliche Beratung, Diagnose oder Behandlung. Bei gesundheitlichen Beschwerden oder medizinischen Entscheidungen sollte immer qualifiziertes medizinisches Fachpersonal einbezogen werden.',
      admin: {
        description: 'Pflichttext — jeder Artikel braucht diesen Hinweis.',
      },
    },
    {
      name: 'changeLog',
      type: 'array',
      label: '9. Änderungsprotokoll',
      admin: {
        description:
          'Protokolliert medizinisch relevante Inhaltsänderungen — nicht jede Tippfehlerkorrektur, sondern substanzielle Aktualisierungen (neue Therapie, neue Studiendaten, Klassifikationsänderung).',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Datum',
          required: true,
        },
        {
          name: 'summary',
          type: 'text',
          label: 'Zusammenfassung der Änderung',
          required: true,
        },
        {
          name: 'changedBy',
          type: 'text',
          label: 'Geändert von (Name / Funktion)',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 6: REDAKTIONELLE AUFBEREITUNG
    // Tags · Arzt-Empfehlung · Kuratierte Links
    // ─────────────────────────────────────────────────────────

    // --- Redaktionelle Tags ---
    {
      name: 'editorialTags',
      type: 'array',
      label: 'Redaktionelle Tags (Patienten-Sprache)',
      admin: {
        description:
          'Frei vergebene Schlagwörter in einfacher Sprache — z.B. "Muskeln", "Kinder", "Erblich", "Schmerzen", "unsichtbare Krankheit", "Diagnose dauert oft Jahre". 3–8 Tags pro Eintrag. Ergänzen die technischen Systemtags aus Organsystem und Ätiologie.',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
          required: true,
        },
      ],
    },

    // --- Arzt-Empfehlung ---
    {
      name: 'doctorGuidance',
      type: 'group',
      label: 'Arzt-Empfehlung — Zu wem gehe ich?',
      admin: {
        description:
          'Der praktisch wichtigste Abschnitt für Betroffene. Erklärt Schritt für Schritt, wen man wann aufsuchen soll — von der ersten Beschwerde bis zum spezialisierten Zentrum.',
      },
      fields: [
        {
          name: 'urgencyNote',
          type: 'select',
          label: 'Dringlichkeit',
          admin: {
            description:
              'Wie dringend sollte die erste Abklärung sein? Orientiert sich an klinischer Leitlinien-Logik (Routineüberweisung vs. dringende Zuweisung vs. Notaufnahme).',
          },
          options: [
            {
              label: 'Routine — innerhalb von Wochen zum Hausarzt/zur Hausärztin',
              value: 'routine',
            },
            {
              label: 'Bald — innerhalb einiger Tage zum Arzt/zur Ärztin',
              value: 'soon',
            },
            {
              label: 'Dringend — noch am selben oder nächsten Tag abklären lassen',
              value: 'urgent',
            },
            {
              label: 'Notfall — sofort in die Notaufnahme oder Rettung rufen (144)',
              value: 'emergency',
            },
          ],
        },
        {
          name: 'firstContact',
          type: 'richText',
          label: 'Erster Schritt — wer zuerst?',
          localized: true,
          admin: {
            description:
              'Wer ist der richtige erste Ansprechpartner? Hausarzt/-ärztin? Kinderarzt/-ärztin? Direkt zur Fachärztin? In einfacher Sprache erklären, warum genau dieser erste Schritt sinnvoll ist.',
          },
        },
        {
          name: 'specialties',
          type: 'relationship',
          label: 'Zuständige Fachrichtungen',
          relationTo: 'specialties',
          hasMany: true,
          admin: {
            description:
              'Alle Fachrichtungen, die für diese Erkrankung relevant sind. Primäre Fachrichtung zuerst auflisten.',
          },
        },
        {
          name: 'specialtiesNote',
          type: 'richText',
          label: 'Warum diese Fachärzt:innen?',
          localized: true,
          admin: {
            description:
              'Kurze Erklärung für Betroffene, warum genau diese Fachrichtungen zuständig sind und was dort passiert. Kein Fachjargon.',
          },
        },
        {
          name: 'diagnosticJourney',
          type: 'richText',
          label: 'Typischer Diagnoseweg',
          localized: true,
          admin: {
            description:
              'Wie sieht der Weg von den ersten Beschwerden bis zur Diagnose typischerweise aus? Welche Stationen, Wartezeiten, Tests sind zu erwarten? Gibt es eine typische Diagnoseverzögerung?',
          },
        },
        {
          name: 'redFlagSymptoms',
          type: 'richText',
          label: 'Warnsignale — wann sofort zum Arzt?',
          localized: true,
          admin: {
            description:
              'Konkrete Warnsignale, bei denen Betroffene nicht warten sollten. Klar, knapp, verständlich — keine Panikmache, aber deutliche Orientierung.',
          },
        },
      ],
    },

    // --- Kuratierte Links ---
    {
      name: 'curatedLinks',
      type: 'array',
      label: 'Kuratierte Links (5 Pflicht)',
      admin: {
        description:
          'Mindestens 5 geprüfte Links pro Erkrankung. Kategorien: Selbsthilfe/Patientenorganisation, Offizielle klinische Quelle, Verständliche Erklärung, Forschung/Studie, Notfall/Erste Orientierung. Links regelmäßig auf Aktualität prüfen.',
      },
      fields: [
        {
          name: 'category',
          type: 'select',
          label: 'Kategorie',
          required: true,
          options: [
            {
              label: 'Selbsthilfe & Patientenorganisation',
              value: 'self_help',
            },
            {
              label: 'Offizielle klinische Quelle (Orphanet, Fachgesellschaft, UniKlinik)',
              value: 'clinical',
            },
            {
              label: 'Verständliche Erklärung (gesundheit.gv.at, Netdoktor, MSD Manual)',
              value: 'layperson',
            },
            {
              label: 'Aktuelle Forschung (PubMed, ClinicalTrials, EURORDIS)',
              value: 'research',
            },
            {
              label: 'Notfall & Erste Orientierung (1450, Krisentelefon, Notaufnahme)',
              value: 'emergency',
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Titel des Links',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
        {
          name: 'language',
          type: 'select',
          label: 'Sprache',
          defaultValue: 'de',
          options: [
            { label: 'Deutsch', value: 'de' },
            { label: 'Englisch', value: 'en' },
          ],
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Kurzbeschreibung (was findet man dort?)',
        },
        {
          name: 'lastChecked',
          type: 'date',
          label: 'Link zuletzt geprüft',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 8: ANLAUFSTELLEN
    // ─────────────────────────────────────────────────────────
    {
      name: 'organizations',
      type: 'relationship',
      label: 'Patient:innenorganisationen',
      relationTo: 'patient-organizations',
      hasMany: true,
    },
    {
      name: 'expertCenters',
      type: 'relationship',
      label: 'Expert:innenzentren (ERNs, Referenzkliniken)',
      relationTo: 'expert-centers',
      hasMany: true,
    },
    {
      name: 'clinicalTrialsInfo',
      type: 'richText',
      label: 'Klinische Studien / Forschungsmöglichkeiten',
      localized: true,
      admin: {
        description:
          'Hinweis auf laufende klinische Studien. ClinicalTrials.gov-Link oder EudraCT-Link. Nur mit hoher redaktioneller Sorgfalt — Studieninhalte regelmäßig aktualisieren.',
      },
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 9: QUELLEN, REVIEW & QUALITÄTSSICHERUNG
    // ─────────────────────────────────────────────────────────
    {
      name: 'sources',
      type: 'relationship',
      label: 'Verwendete Quellen (mit Lizenz)',
      relationTo: 'sources',
      hasMany: true,
      admin: {
        description: 'Alle verwendeten Quellen mit Lizenz-Dokumentation. Urheberrechtlich kritisch: keine Texte kopieren, Lizenzen (ORPHA CC BY 4.0, etc.) sauber dokumentieren.',
      },
    },
    {
      name: 'expertReviews',
      type: 'relationship',
      label: 'Medizinische Prüfungen',
      relationTo: 'expert-reviews',
      hasMany: true,
    },
    {
      name: 'patientStories',
      type: 'relationship',
      label: 'Erfahrungsberichte',
      relationTo: 'patient-stories',
      hasMany: true,
    },
    {
      name: 'nextReviewAt',
      type: 'date',
      label: 'Nächste Überprüfung fällig',
      admin: {
        description: 'Empfehlung: 12 Monate. Bei Erkrankungen mit aktiver Therapieentwicklung kürzer.',
      },
    },

    // ─────────────────────────────────────────────────────────
    // ABSCHNITT 10: META
    // ─────────────────────────────────────────────────────────
    {
      name: 'featuredImage',
      type: 'upload',
      label: 'Vorschaubild',
      relationTo: 'media',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Redaktioneller Status',
      options: [
        { label: 'Entwurf — noch nicht zur Veröffentlichung freigegeben', value: 'draft' },
        { label: 'In medizinischer Prüfung', value: 'medical_review' },
        { label: 'In redaktioneller Prüfung', value: 'editorial_review' },
        { label: 'In juristischer Prüfung', value: 'legal_review' },
        { label: 'Veröffentlicht', value: 'published' },
        { label: 'Archiviert / Veraltet', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
        description: 'Workflow: Entwurf → Medizinische Prüfung → Redaktionelle Prüfung → Veröffentlicht',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlicht am',
      admin: {
        position: 'sidebar',
        description: 'Wird automatisch gesetzt wenn Status → Veröffentlicht.',
        readOnly: false,
      },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Zuletzt geprüft am',
      admin: {
        position: 'sidebar',
        description: 'Datum der letzten inhaltlichen Prüfung durch einen Mediziner oder Redakteur.',
      },
    },
    {
      name: 'submittedForReviewAt',
      type: 'date',
      label: 'Zur Prüfung eingereicht am',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Wird automatisch gesetzt wenn Status auf Prüfung wechselt.',
      },
    },
    {
      name: 'editorialNotes',
      type: 'textarea',
      label: 'Redaktionelle Notizen (intern)',
      admin: {
        description: 'Interne Hinweise für das Redaktionsteam — nicht öffentlich sichtbar.',
      },
    },
  ],
}
