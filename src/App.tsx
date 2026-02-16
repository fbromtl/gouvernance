import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/lib/ProtectedRoute";

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

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";

import { PortailLayout } from "@/portail/layout/PortailLayout";
import DashboardPage from "@/portail/pages/DashboardPage";
import ConditionsPage from "@/portail/pages/ConditionsPage";

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

            {/* Pages légales */}
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
            <Route path="/accessibilite" element={<AccessibilitePage />} />
          </Route>

          {/* Pages d'authentification (avec Layout pour header/footer) */}
          <Route element={<Layout />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
          </Route>

          {/* Callback OAuth — doit être hors Layout et hors ProtectedRoute */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Portail SaaS (protégé) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PortailLayout />}>
              <Route path="/portail" element={<DashboardPage />} />
            </Route>
            <Route path="/portail/conditions" element={<ConditionsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
