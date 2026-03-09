import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";

// Eagerly loaded — critical for first paint
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";

// ---------- Lazy-loaded: Site vitrine ----------
const AProposPage = lazy(() => import("@/pages/AProposPage").then(m => ({ default: m.AProposPage })));
const ExpertsPage = lazy(() => import("@/pages/ExpertsPage").then(m => ({ default: m.ExpertsPage })));
const RessourcesPage = lazy(() => import("@/pages/RessourcesPage").then(m => ({ default: m.RessourcesPage })));
const RejoindrePage = lazy(() => import("@/pages/RejoindrePage").then(m => ({ default: m.RejoindrePage })));
const ActualitesPage = lazy(() => import("@/pages/ActualitesPage").then(m => ({ default: m.ActualitesPage })));
const ArticlePage = lazy(() => import("@/pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })));
const TarifsPage = lazy(() => import("@/pages/TarifsPage").then(m => ({ default: m.TarifsPage })));
const FonctionnalitesPage = lazy(() => import("@/pages/FonctionnalitesPage").then(m => ({ default: m.FonctionnalitesPage })));
const MembresHonorairesPage = lazy(() => import("@/pages/MembresHonorairesPage").then(m => ({ default: m.MembresHonorairesPage })));
const ConfidentialitePage = lazy(() => import("@/pages/ConfidentialitePage").then(m => ({ default: m.ConfidentialitePage })));
const MentionsLegalesPage = lazy(() => import("@/pages/MentionsLegalesPage").then(m => ({ default: m.MentionsLegalesPage })));
const AccessibilitePage = lazy(() => import("@/pages/AccessibilitePage").then(m => ({ default: m.AccessibilitePage })));
const DiagnosticPage = lazy(() => import("@/pages/DiagnosticPage"));
const DiagnosticResultsPage = lazy(() => import("@/pages/DiagnosticResultsPage"));
const MemberPublicPage = lazy(() => import("@/pages/MemberPublicPage").then(m => ({ default: m.MemberPublicPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// ---------- Lazy-loaded: Auth ----------
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("@/pages/auth/AuthCallbackPage"));

// ---------- Lazy-loaded: Portail layout ----------
const PortailLayout = lazy(() => import("@/portail/layout/PortailLayout").then(m => ({ default: m.PortailLayout })));

// ---------- Lazy-loaded: Portail pages ----------
const DashboardPage = lazy(() => import("@/portail/pages/DashboardPage"));
const ProfilPage = lazy(() => import("@/portail/pages/ProfilPage"));
const ConditionsPage = lazy(() => import("@/portail/pages/ConditionsPage"));
const OnboardingPage = lazy(() => import("@/portail/pages/OnboardingPage"));
const AiSystemsListPage = lazy(() => import("@/portail/pages/AiSystemsListPage"));
const AiSystemWizardPage = lazy(() => import("@/portail/pages/AiSystemWizardPage"));
const AiSystemDetailPage = lazy(() => import("@/portail/pages/AiSystemDetailPage"));
const RiskAssessmentListPage = lazy(() => import("@/portail/pages/RiskAssessmentListPage"));
const RiskAssessmentWizardPage = lazy(() => import("@/portail/pages/RiskAssessmentWizardPage"));
const RiskAssessmentDetailPage = lazy(() => import("@/portail/pages/RiskAssessmentDetailPage"));
const IncidentListPage = lazy(() => import("@/portail/pages/IncidentListPage"));
const IncidentReportPage = lazy(() => import("@/portail/pages/IncidentReportPage"));
const IncidentDetailPage = lazy(() => import("@/portail/pages/IncidentDetailPage"));
const GovernancePage = lazy(() => import("@/portail/pages/GovernancePage"));
const DecisionsPage = lazy(() => import("@/portail/pages/DecisionsPage"));
const CompliancePage = lazy(() => import("@/portail/pages/CompliancePage"));
const BiasPage = lazy(() => import("@/portail/pages/BiasPage"));
const TransparencyPage = lazy(() => import("@/portail/pages/TransparencyPage"));
const LifecyclePage = lazy(() => import("@/portail/pages/LifecyclePage"));
const DocumentsPage = lazy(() => import("@/portail/pages/DocumentsPage"));
const MonitoringPage = lazy(() => import("@/portail/pages/MonitoringPage"));
const DataPage = lazy(() => import("@/portail/pages/DataPage"));
const VendorsPage = lazy(() => import("@/portail/pages/VendorsPage"));
const VeillePage = lazy(() => import("@/portail/pages/VeillePage"));
const BibliothecPage = lazy(() => import("@/portail/pages/BibliothecPage"));
const ModelesBibliothequePage = lazy(() => import("@/portail/pages/ModelesBibliothequePage"));
const MembresPage = lazy(() => import("@/portail/pages/MembresPage"));
const AgentsPage = lazy(() => import("@/portail/pages/AgentsPage"));
const AgentTracesPage = lazy(() => import("@/portail/pages/AgentTracesPage"));
const RoadmapPage = lazy(() => import("@/portail/pages/RoadmapPage"));
const AdminPage = lazy(() => import("@/portail/pages/AdminPage"));
const BillingPage = lazy(() => import("@/portail/pages/BillingPage"));

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-forest border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Site vitrine */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/a-propos" element={<AProposPage />} />
              <Route path="/experts" element={<ExpertsPage />} />
              <Route path="/ressources" element={<RessourcesPage />} />

              <Route path="/rejoindre" element={<RejoindrePage />} />

              <Route path="/actualites" element={<ActualitesPage />} />
              <Route path="/actualites/:slug" element={<ArticlePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/tarifs" element={<TarifsPage />} />
              <Route path="/fonctionnalites" element={<FonctionnalitesPage />} />
              <Route path="/membres-honoraires" element={<MembresHonorairesPage />} />
              <Route path="/confidentialite" element={<ConfidentialitePage />} />
              <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
              <Route path="/accessibilite" element={<AccessibilitePage />} />
            </Route>

            {/* Auth pages */}
            <Route element={<Layout />}>
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/inscription" element={<RegisterPage />} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            </Route>

            {/* Diagnostic public (standalone, no header/footer) */}
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/diagnostic/resultats" element={<DiagnosticResultsPage />} />

            {/* Public member profiles */}
            <Route path="/membres/:slug" element={<MemberPublicPage />} />

            {/* OAuth callback */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Portail SaaS (protégé) */}
            <Route element={<ProtectedRoute />}>
              {/* CGU et onboarding (hors layout portail) */}
              <Route path="/conditions" element={<ConditionsPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<PortailLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/veille" element={<VeillePage />} />
                <Route path="/bibliotheque" element={<BibliothecPage />} />
                <Route path="/modeles" element={<ModelesBibliothequePage />} />
                <Route path="/profile" element={<ProfilPage />} />

                {/* Module: AI Systems */}
                <Route path="/ai-systems" element={<AiSystemsListPage />} />
                <Route path="/ai-systems/new" element={<AiSystemWizardPage />} />
                <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
                <Route path="/ai-systems/:id/edit" element={<AiSystemWizardPage />} />

                {/* Module: Risk Assessments */}
                <Route path="/risks" element={<RiskAssessmentListPage />} />
                <Route path="/risks/new" element={<RiskAssessmentWizardPage />} />
                <Route path="/risks/:id/edit" element={<RiskAssessmentWizardPage />} />
                <Route path="/risks/:id" element={<RiskAssessmentDetailPage />} />

                {/* Module: Incidents */}
                <Route path="/incidents" element={<IncidentListPage />} />
                <Route path="/incidents/new" element={<IncidentReportPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailPage />} />

                {/* Modules — placeholder pages (Phase 3+) */}
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/decisions" element={<DecisionsPage />} />
                <Route path="/bias" element={<BiasPage />} />
                <Route path="/transparency" element={<TransparencyPage />} />
                <Route path="/lifecycle" element={<LifecyclePage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/monitoring" element={<MonitoringPage />} />
                <Route path="/data" element={<DataPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/membres" element={<MembresPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/agent-traces" element={<AgentTracesPage />} />
                <Route path="/roadmap" element={<RoadmapPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/billing" element={<BillingPage />} />
              </Route>

              {/* Redirects from old routes */}
              <Route path="/portail" element={<Navigate to="/dashboard" replace />} />
              <Route path="/portail/profil" element={<Navigate to="/profile" replace />} />
              <Route path="/portail/conditions" element={<Navigate to="/conditions" replace />} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
