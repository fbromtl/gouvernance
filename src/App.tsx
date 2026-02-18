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
import PlaceholderPage from "@/portail/pages/PlaceholderPage";

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
            {/* CGU (hors layout portail) */}
            <Route path="/conditions" element={<ConditionsPage />} />

            <Route element={<PortailLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilPage />} />

              {/* Modules — placeholder pages */}
              <Route path="/ai-systems" element={<PlaceholderPage />} />
              <Route path="/governance" element={<PlaceholderPage />} />
              <Route path="/risks" element={<PlaceholderPage />} />
              <Route path="/decisions" element={<PlaceholderPage />} />
              <Route path="/bias" element={<PlaceholderPage />} />
              <Route path="/incidents" element={<PlaceholderPage />} />
              <Route path="/transparency" element={<PlaceholderPage />} />
              <Route path="/lifecycle" element={<PlaceholderPage />} />
              <Route path="/documents" element={<PlaceholderPage />} />
              <Route path="/monitoring" element={<PlaceholderPage />} />
              <Route path="/data" element={<PlaceholderPage />} />
              <Route path="/vendors" element={<PlaceholderPage />} />
              <Route path="/compliance" element={<PlaceholderPage />} />
              <Route path="/admin" element={<PlaceholderPage />} />
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
