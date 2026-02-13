import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Pages principales */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
