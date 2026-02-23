import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import frCommon from './locales/fr/common.json'
import frDashboard from './locales/fr/dashboard.json'
import frProfil from './locales/fr/profil.json'
import frConditions from './locales/fr/conditions.json'
import frPortail from './locales/fr/portail.json'
import frAiSystems from './locales/fr/aiSystems.json'
import frRiskAssessments from './locales/fr/riskAssessments.json'
import frIncidents from './locales/fr/incidents.json'
import frAdmin from './locales/fr/admin.json'
import frGovernance from './locales/fr/governance.json'
import frOnboarding from './locales/fr/onboarding.json'
import frCompliance from './locales/fr/compliance.json'
import frDecisions from './locales/fr/decisions.json'
import frBias from './locales/fr/bias.json'
import frTransparency from './locales/fr/transparency.json'
import frVendors from './locales/fr/vendors.json'
import frLifecycle from './locales/fr/lifecycle.json'
import frDocuments from './locales/fr/documents.json'
import frMonitoring from './locales/fr/monitoring.json'
import frData from './locales/fr/data.json'
import frAiChat from './locales/fr/aiChat.json'
import frVeille from './locales/fr/veille.json'
import frDiagnostic from './locales/fr/diagnostic.json'
import frBilling from './locales/fr/billing.json'
import frMembers from './locales/fr/members.json'
import frAgents from './locales/fr/agents.json'
import frAgentTraces from './locales/fr/agentTraces.json'

import enCommon from './locales/en/common.json'
import enDashboard from './locales/en/dashboard.json'
import enProfil from './locales/en/profil.json'
import enConditions from './locales/en/conditions.json'
import enPortail from './locales/en/portail.json'
import enAiSystems from './locales/en/aiSystems.json'
import enRiskAssessments from './locales/en/riskAssessments.json'
import enIncidents from './locales/en/incidents.json'
import enAdmin from './locales/en/admin.json'
import enGovernance from './locales/en/governance.json'
import enOnboarding from './locales/en/onboarding.json'
import enCompliance from './locales/en/compliance.json'
import enDecisions from './locales/en/decisions.json'
import enBias from './locales/en/bias.json'
import enTransparency from './locales/en/transparency.json'
import enVendors from './locales/en/vendors.json'
import enLifecycle from './locales/en/lifecycle.json'
import enDocuments from './locales/en/documents.json'
import enMonitoring from './locales/en/monitoring.json'
import enData from './locales/en/data.json'
import enAiChat from './locales/en/aiChat.json'
import enVeille from './locales/en/veille.json'
import enDiagnostic from './locales/en/diagnostic.json'
import enBilling from './locales/en/billing.json'
import enMembers from './locales/en/members.json'
import enAgents from './locales/en/agents.json'
import enAgentTraces from './locales/en/agentTraces.json'

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
        riskAssessments: frRiskAssessments,
        incidents: frIncidents,
        admin: frAdmin,
        governance: frGovernance,
        onboarding: frOnboarding,
        compliance: frCompliance,
        decisions: frDecisions,
        bias: frBias,
        transparency: frTransparency,
        vendors: frVendors,
        lifecycle: frLifecycle,
        documents: frDocuments,
        monitoring: frMonitoring,
        data: frData,
        aiChat: frAiChat,
        veille: frVeille,
        diagnostic: frDiagnostic,
        billing: frBilling,
        members: frMembers,
        agents: frAgents,
        agentTraces: frAgentTraces,
      },
      en: {
        common: enCommon,
        dashboard: enDashboard,
        profil: enProfil,
        conditions: enConditions,
        portail: enPortail,
        aiSystems: enAiSystems,
        riskAssessments: enRiskAssessments,
        incidents: enIncidents,
        admin: enAdmin,
        governance: enGovernance,
        onboarding: enOnboarding,
        compliance: enCompliance,
        decisions: enDecisions,
        bias: enBias,
        transparency: enTransparency,
        vendors: enVendors,
        lifecycle: enLifecycle,
        documents: enDocuments,
        monitoring: enMonitoring,
        data: enData,
        aiChat: enAiChat,
        veille: enVeille,
        diagnostic: enDiagnostic,
        billing: enBilling,
        members: enMembers,
        agents: enAgents,
        agentTraces: enAgentTraces,
      },
    },
    fallbackLng: 'fr',
    defaultNS,
    ns: ['common', 'dashboard', 'profil', 'conditions', 'portail', 'aiSystems', 'riskAssessments', 'incidents', 'admin', 'governance', 'onboarding', 'compliance', 'decisions', 'bias', 'transparency', 'vendors', 'lifecycle', 'documents', 'monitoring', 'data', 'aiChat', 'veille', 'diagnostic', 'billing', 'members', 'agents', 'agentTraces'],
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
