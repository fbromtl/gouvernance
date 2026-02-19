import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";

// Site vitrine
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { AProposPage } from "@/pages/AProposPage";
import { ExpertsPage } from "@/pages/ExpertsPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { RessourcesPage } from "@/pages/RessourcesPage";
import { EvenementsPage } from "@/pages/EvenementsPage";
import { RejoindrePage } from "@/pages/RejoindrePage";
import { OrganisationsPage } from "@/pages/OrganisationsPage";
import { ActualitesPage } from "@/pages/ActualitesPage";
import { ContactPage } from "@/pages/ContactPage";
import { ConfidentialitePage } from "@/pages/ConfidentialitePage";
import { MentionsLegalesPage } from "@/pages/MentionsLegalesPage";
import { AccessibilitePage } from "@/pages/AccessibilitePage";

// Auth
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";

// Portail
import { PortailLayout } from "@/portail/layout/PortailLayout";
import DashboardPage from "@/portail/pages/DashboardPage";
import ProfilPage from "@/portail/pages/ProfilPage";
import ConditionsPage from "@/portail/pages/ConditionsPage";
// Module: AI Systems
import AiSystemsListPage from "@/portail/pages/AiSystemsListPage";
import AiSystemWizardPage from "@/portail/pages/AiSystemWizardPage";
import AiSystemDetailPage from "@/portail/pages/AiSystemDetailPage";

// Module: Risk Assessments
import RiskAssessmentListPage from "@/portail/pages/RiskAssessmentListPage";
import RiskAssessmentWizardPage from "@/portail/pages/RiskAssessmentWizardPage";
import RiskAssessmentDetailPage from "@/portail/pages/RiskAssessmentDetailPage";

// Module: Incidents
import IncidentListPage from "@/portail/pages/IncidentListPage";
import IncidentReportPage from "@/portail/pages/IncidentReportPage";
import IncidentDetailPage from "@/portail/pages/IncidentDetailPage";

// Module: Admin
import AdminPage from "@/portail/pages/AdminPage";

// Module: Governance
import GovernancePage from "@/portail/pages/GovernancePage";

// Module: Compliance
import CompliancePage from "@/portail/pages/CompliancePage";

// Module: Decisions
import DecisionsPage from "@/portail/pages/DecisionsPage";

// Module: Bias
import BiasPage from "@/portail/pages/BiasPage";

// Module: Transparency
import TransparencyPage from "@/portail/pages/TransparencyPage";

// Module: Lifecycle
import LifecyclePage from "@/portail/pages/LifecyclePage";

// Module: Vendors
import VendorsPage from "@/portail/pages/VendorsPage";

// Module: Documents
import DocumentsPage from "@/portail/pages/DocumentsPage";

// Module: Monitoring
import MonitoringPage from "@/portail/pages/MonitoringPage";

// Module: Data
import DataPage from "@/portail/pages/DataPage";

// Onboarding
import OnboardingPage from "@/portail/pages/OnboardingPage";
import RoadmapPage from "@/portail/pages/RoadmapPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Site vitrine */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/a-propos" element={<AProposPage />} />
            <Route path="/experts" element={<ExpertsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/ressources" element={<RessourcesPage />} />
            <Route path="/evenements" element={<EvenementsPage />} />
            <Route path="/rejoindre" element={<RejoindrePage />} />
            <Route path="/organisations" element={<OrganisationsPage />} />
            <Route path="/actualites" element={<ActualitesPage />} />
            <Route path="/contact" element={<ContactPage />} />
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

          {/* OAuth callback */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Portail SaaS (protégé) */}
          <Route element={<ProtectedRoute />}>
            {/* CGU et onboarding (hors layout portail) */}
            <Route path="/conditions" element={<ConditionsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route element={<PortailLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilPage />} />

              {/* Module: AI Systems */}
              <Route path="/ai-systems" element={<AiSystemsListPage />} />
              <Route path="/ai-systems/new" element={<AiSystemWizardPage />} />
              <Route path="/ai-systems/:id" element={<AiSystemDetailPage />} />
              <Route path="/ai-systems/:id/edit" element={<AiSystemWizardPage />} />

              {/* Module: Risk Assessments */}
              <Route path="/risks" element={<RiskAssessmentListPage />} />
              <Route path="/risks/new" element={<RiskAssessmentWizardPage />} />
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
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            {/* Redirects from old routes */}
            <Route path="/portail" element={<Navigate to="/dashboard" replace />} />
            <Route path="/portail/profil" element={<Navigate to="/profile" replace />} />
            <Route path="/portail/conditions" element={<Navigate to="/conditions" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
