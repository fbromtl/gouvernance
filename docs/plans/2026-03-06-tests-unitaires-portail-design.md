# Design — Tests unitaires exhaustifs du portail SaaS

**Date** : 2026-03-06
**Scope** : Couverture exhaustive des 30+ modules du portail gouvernance.ai
**Approche** : Bottom-up (logique pure → hooks → composants → pages)

---

## Stack

| Package | Rôle |
|---------|------|
| vitest | Test runner Vite-native |
| @testing-library/react | Rendu composants + queries DOM |
| @testing-library/user-event | Interactions utilisateur réalistes |
| @testing-library/jest-dom | Matchers DOM (toBeVisible, toHaveTextContent) |
| msw | Mock Service Worker — intercepte PostgREST/Supabase |
| @vitest/coverage-v8 | Rapports de couverture |
| jsdom | Environnement DOM |

---

## Architecture

```
src/__tests__/
├── setup.ts                         # Setup global (MSW, i18n, QueryClient)
├── mocks/
│   ├── handlers.ts                  # MSW handlers Supabase PostgREST
│   ├── server.ts                    # MSW server instance
│   ├── fixtures/                    # Données de test par module
│   │   ├── ai-systems.ts
│   │   ├── risks.ts
│   │   ├── incidents.ts
│   │   ├── compliance.ts
│   │   ├── users.ts
│   │   ├── decisions.ts
│   │   ├── governance.ts
│   │   ├── vendors.ts
│   │   ├── documents.ts
│   │   ├── monitoring.ts
│   │   ├── agents.ts
│   │   └── index.ts
│   └── utils.ts                     # renderWithProviders, mockAuth, createWrapper
│
├── lib/                             # Logique pure (~60 tests)
│   ├── compliance-frameworks.test.ts
│   ├── permissions.test.ts
│   └── utils.test.ts
│
├── hooks/                           # Hooks (~150 tests)
│   ├── useAiSystems.test.ts
│   ├── useRiskAssessments.test.ts
│   ├── useCompliance.test.ts
│   ├── useIncidents.test.ts
│   ├── useDecisions.test.ts
│   ├── useBiasFindings.test.ts
│   ├── useTransparency.test.ts
│   ├── useLifecycleEvents.test.ts
│   ├── useDocuments.test.ts
│   ├── useMonitoring.test.ts
│   ├── useData.test.ts
│   ├── useVendors.test.ts
│   ├── useAgentRegistry.test.ts
│   ├── useAgentTraces.test.ts
│   ├── useMembers.test.ts
│   ├── useOrgMembers.test.ts
│   ├── useOrganization.test.ts
│   ├── useSubscription.test.ts
│   ├── usePermissions.test.ts
│   ├── useNotifications.test.ts
│   ├── useDiagnostic.test.ts
│   ├── useAiChat.test.ts
│   ├── usePublicChat.test.ts
│   ├── useAdminMutations.test.ts
│   ├── useGovernanceRoles.test.ts
│   ├── useCommittees.test.ts
│   ├── usePolicies.test.ts
│   ├── useCurrentRole.test.ts
│   ├── useAuditLog.test.ts
│   ├── useFeaturePreview.test.ts
│   ├── usePageContext.test.ts
│   ├── usePlanFeatures.test.ts
│   ├── usePublicDocuments.test.ts
│   └── useUserNames.test.ts
│
├── components/                      # Composants (~80 tests)
│   ├── dashboard/
│   │   ├── ComplianceRadarChart.test.tsx
│   │   ├── RiskDistributionChart.test.tsx
│   │   ├── IncidentTimelineChart.test.tsx
│   │   ├── SystemsByTypeChart.test.tsx
│   │   ├── TopRiskSystemsTable.test.tsx
│   │   ├── PendingActionsWidget.test.tsx
│   │   ├── ReviewsDueWidget.test.tsx
│   │   ├── RecentDecisionsWidget.test.tsx
│   │   ├── BiasDebtWidget.test.tsx
│   │   ├── AgentActivityWidget.test.tsx
│   │   └── DiagnosticResultWidget.test.tsx
│   ├── drive/
│   │   ├── ClassificationReview.test.tsx
│   │   ├── FileDetail.test.tsx
│   │   ├── DropZone.test.tsx
│   │   └── FileCard.test.tsx
│   ├── agents/
│   │   └── CreateAgentDialog.test.tsx
│   ├── templates/
│   │   ├── TemplateCard.test.tsx
│   │   └── TemplatePreviewSheet.test.tsx
│   ├── chat/
│   │   ├── FloatingChat.test.tsx
│   │   └── AiChatPanel.test.tsx
│   └── ui/
│       ├── PortalCard.test.tsx
│       └── PortalKPI.test.tsx
│
└── pages/                           # Pages (~150 tests)
    ├── DashboardPage.test.tsx
    ├── AiSystemsListPage.test.tsx
    ├── AiSystemWizardPage.test.tsx
    ├── AiSystemDetailPage.test.tsx
    ├── RiskAssessmentListPage.test.tsx
    ├── RiskAssessmentWizardPage.test.tsx
    ├── RiskAssessmentDetailPage.test.tsx
    ├── IncidentListPage.test.tsx
    ├── IncidentReportPage.test.tsx
    ├── IncidentDetailPage.test.tsx
    ├── GovernancePage.test.tsx
    ├── DecisionsPage.test.tsx
    ├── CompliancePage.test.tsx
    ├── BiasPage.test.tsx
    ├── TransparencyPage.test.tsx
    ├── LifecyclePage.test.tsx
    ├── DocumentsPage.test.tsx
    ├── MonitoringPage.test.tsx
    ├── DataPage.test.tsx
    ├── VendorsPage.test.tsx
    ├── VeillePage.test.tsx
    ├── MembresPage.test.tsx
    ├── AgentsPage.test.tsx
    ├── AgentTracesPage.test.tsx
    ├── ProfilPage.test.tsx
    ├── AdminPage.test.tsx
    ├── BillingPage.test.tsx
    ├── OnboardingPage.test.tsx
    ├── RoadmapPage.test.tsx
    └── ConditionsPage.test.tsx
```

---

## Infrastructure de mocking

### MSW — Mock Service Worker

Intercepte les requêtes HTTP PostgREST au niveau réseau. Aucun mock du client Supabase nécessaire.

Handlers organisés par table :
- `GET /rest/v1/ai_systems*` → fixtures ai-systems
- `POST /rest/v1/ai_systems` → insert mock
- `PATCH /rest/v1/ai_systems*` → update mock
- `DELETE /rest/v1/ai_systems*` → delete mock
- Idem pour chaque table (incidents, risks, decisions, compliance, etc.)
- Edge functions : `POST /functions/v1/ai-chat`, `POST /functions/v1/public-chat`, etc.

### renderWithProviders

Wrapper de test qui injecte automatiquement :
- `QueryClientProvider` (cache désactivé, retry: false)
- `AuthContext` mocké (user, profile, organization_id configurables)
- `MemoryRouter` (route initiale configurable)
- `I18nextProvider` (FR par défaut)

### Fixtures

Données de test typées, cohérentes entre elles (un ai_system référence un user/org existant dans les fixtures).

---

## Couverture par couche

| Couche | Fichiers | Tests | Ce qu'on teste |
|--------|----------|-------|----------------|
| Logique pure | 5 | ~60 | Calculs scores, permissions, utils |
| Hooks | 34 | ~150 | Queries, mutations, cache, erreurs |
| Composants | 25 | ~80 | Rendu, props, interactions, états |
| Pages | 30 | ~150 | Rendu initial, CRUD, filtres, navigation |
| **Total** | **94** | **~440** | |

## Couverture cible

| Métrique | Cible |
|----------|-------|
| Statements | >= 80% |
| Branches | >= 75% |
| Functions | >= 85% |
| Lignes | >= 80% |

---

## Scripts npm

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "test:watch": "vitest --watch"
}
```

---

## Phases d'implémentation

1. **Setup** — Install deps, vitest.config, setup.ts, MSW server, renderWithProviders
2. **Phase 1** — Logique pure (compliance-frameworks, scoring, permissions, utils)
3. **Phase 2** — Hooks (34 hooks, par ordre de criticité)
4. **Phase 3** — Composants (dashboard widgets, drive, shared, chat)
5. **Phase 4** — Pages (30 pages portail, par complexité croissante)
6. **Phase 5** — Coverage report, CI integration, cleanup
