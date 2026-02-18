import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import frCommon from './locales/fr/common.json'
import frDashboard from './locales/fr/dashboard.json'
import frProfil from './locales/fr/profil.json'
import frConditions from './locales/fr/conditions.json'
import frPortail from './locales/fr/portail.json'
import frAiSystems from './locales/fr/aiSystems.json'

import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enProfil from './locales/en/profil.json'
import enConditions from './locales/en/conditions.json'
import enPortail from './locales/en/portail.json'
import enAiSystems from './locales/en/aiSystems.json'

export const defaultNS = 'common'
export const supportedLanguages = ['fr', 'en'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        common: frCommon,
        dashboard: frDashboard,
        profil: frProfil,
        conditions: frConditions,
        portail: frPortail,
        aiSystems: frAiSystems,
      },
      en: {
        common: enCommon,
        dashboard: enDashboard,
        profil: enProfil,
        conditions: enConditions,
        portail: enPortail,
        aiSystems: enAiSystems,
      },
    },
    fallbackLng: 'fr',
    defaultNS,
    ns: ['common', 'dashboard', 'profil', 'conditions', 'portail', 'aiSystems'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  })

export default i18n
