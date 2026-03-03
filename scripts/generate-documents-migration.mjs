/**
 * Generate SQL migration for public_documents from static files in public/documents/
 * Usage: node scripts/generate-documents-migration.mjs
 */
import { readdirSync, writeFileSync } from "fs";
import { join, basename } from "path";

const PUBLIC_DIR = "public/documents";
const OUTPUT = "supabase/migrations/20260303000001_seed_public_documents_canada_europe_france_usa.sql";

// Proper French category names with accents
const CATEGORY_NAMES = {
  // Canada
  "canada|01-lois-federales": "Lois fédérales",
  "canada|02-directives-conseil-tresor": "Directives du Conseil du Trésor",
  "canada|03-strategie-nationale-instituts": "Stratégie nationale et instituts",
  "canada|04-commissariat-vie-privee": "Commissariat à la vie privée",
  "canada|05-normes-codes-volontaires": "Normes et codes volontaires",
  "canada|06-concurrence-regulateurs-sectoriels": "Concurrence et régulateurs sectoriels",
  "canada|07-guides-pratiques-outils": "Guides pratiques et outils",
  "canada|08-articles-analyse-juridique": "Articles et analyses juridiques",
  // Europe
  "europe|01-reglement-ia-eu-ai-act": "Règlement IA — EU AI Act",
  "europe|02-pratiques-interdites-risques": "Pratiques interdites et risques",
  "europe|03-rgpd-protection-donnees-ia": "RGPD et protection des données IA",
  "europe|04-responsabilite-securite-produits": "Responsabilité et sécurité des produits",
  "europe|05-ecosysteme-reglementaire-numerique": "Écosystème réglementaire numérique",
  "europe|06-gouvernance-institutions-normes": "Gouvernance, institutions et normes",
  "europe|07-modeles-ia-usage-general-gpai": "Modèles IA à usage général (GPAI)",
  "europe|08-guides-pratiques-conformite": "Guides pratiques de conformité",
  "europe|09-analyses-juridiques-cabinets": "Analyses juridiques",
  // France
  "france|01-textes-europeens-officiels": "Textes européens officiels",
  "france|02-textes-francais-legifrance": "Textes français — Légifrance",
  "france|03-cnil-guides-recommandations": "CNIL — Guides et recommandations",
  "france|04-gouvernement-dge-strategie": "Gouvernement et DGE — Stratégie",
  "france|05-autorites-sectorielles": "Autorités sectorielles",
  "france|06-articles-analyse-guides": "Articles, analyses et guides",
  "france|07-sanctions-formation": "Sanctions et formation",
  "france|08-references-academiques": "Références académiques",
  "france|09-sources-reglementaires-pdf": "Sources réglementaires",
  // USA
  "usa|01-decrets-presidentiels-executive-orders": "Décrets présidentiels (Executive Orders)",
  "usa|02-lois-federales-projets-loi": "Lois fédérales et projets de loi",
  "usa|03-agences-federales-cadres-reglementaires": "Agences fédérales et cadres réglementaires",
  "usa|04-nist-normes-techniques": "NIST — Normes techniques",
  "usa|05-protection-donnees-vie-privee": "Protection des données et vie privée",
  "usa|06-reglementation-sectorielle": "Réglementation sectorielle",
  "usa|07-lois-etatiques-etats": "Lois étatiques",
  "usa|08-propriete-intellectuelle-droit-auteur": "Propriété intellectuelle et droit d'auteur",
  "usa|09-securite-nationale-defense": "Sécurité nationale et défense",
  "usa|10-guides-pratiques-gouvernance": "Guides pratiques de gouvernance",
  "usa|11-articles-analyses-juridiques": "Articles et analyses juridiques",
};

function cleanTitle(filename) {
  let title = filename
    .replace(/^\d+-/, "")       // Remove leading number prefix
    .replace(/\.pdf$/, "")       // Remove extension
    .replace(/-/g, " ");         // Replace dashes with spaces

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Fix common acronyms and terms
  title = title
    .replace(/\bia\b/gi, "IA")
    .replace(/\bai\b/gi, "AI")
    .replace(/\beu\b/gi, "EU")
    .replace(/\bue\b/gi, "UE")
    .replace(/\brgpd\b/gi, "RGPD")
    .replace(/\bnist\b/gi, "NIST")
    .replace(/\bgpai\b/gi, "GPAI")
    .replace(/\bcnil\b/gi, "CNIL")
    .replace(/\bopc\b/gi, "OPC")
    .replace(/\biso\b/gi, "ISO")
    .replace(/\bieee\b/gi, "IEEE")
    .replace(/\bpipeda\b/gi, "PIPEDA")
    .replace(/\baida\b/gi, "AIDA")
    .replace(/\bdsa\b/gi, "DSA")
    .replace(/\bdma\b/gi, "DMA")
    .replace(/\bftc\b/gi, "FTC")
    .replace(/\bfda\b/gi, "FDA")
    .replace(/\bsec\b/gi, "SEC")
    .replace(/\beeoc\b/gi, "EEOC")
    .replace(/\bcfpb\b/gi, "CFPB")
    .replace(/\bdod\b/gi, "DoD")
    .replace(/\bnsa\b/gi, "NSA")
    .replace(/\bcisa\b/gi, "CISA")
    .replace(/\bfcc\b/gi, "FCC")
    .replace(/\bomb\b/gi, "OMB")
    .replace(/\busco\b/gi, "USCO")
    .replace(/\buspto\b/gi, "USPTO")
    .replace(/\bostp\b/gi, "OSTP")
    .replace(/\bcaisi\b/gi, "CAISI")
    .replace(/\bacvm\b/gi, "ACVM")
    .replace(/\bbsif\b/gi, "BSIF")
    .replace(/\bosfi\b/gi, "OSFI")
    .replace(/\bcai\b/gi, "CAI")
    .replace(/\bcest\b/gi, "CEST")
    .replace(/\bmcn\b/gi, "MCN")
    .replace(/\bdge\b/gi, "DGE")
    .replace(/\bdpo\b/gi, "DPO")
    .replace(/\bccpa\b/gi, "CCPA")
    .replace(/\bcpra\b/gi, "CPRA")
    .replace(/\bhipaa\b/gi, "HIPAA")
    .replace(/\bcoppa\b/gi, "COPPA")
    .replace(/\bferpa\b/gi, "FERPA")
    .replace(/\biapp\b/gi, "IAPP")
    .replace(/\bnis2\b/gi, "NIS2")
    .replace(/\bpdf\b/gi, "PDF")
    .replace(/\bhleg\b/gi, "HLEG")
    .replace(/\bncsl\b/gi, "NCSL")
    .replace(/\bcrs\b/gi, "CRS")
    .replace(/\baisi\b/gi, "AISI")
    .replace(/\bcdao\b/gi, "CDAO")
    .replace(/\bacpr\b/gi, "ACPR")
    .replace(/\beidas\b/gi, "eIDAS")
    .replace(/\bcepd\b/gi, "CEPD")
    .replace(/\bedpb\b/gi, "EDPB")
    .replace(/\bapra\b/gi, "APRA")
    .replace(/\bbipa\b/gi, "BIPA")
    .replace(/\bndaa\b/gi, "NDAA")
    .replace(/\bsnia\b/gi, "SNIA")
    .replace(/\bcms\b/gi, "CMS")
    .replace(/\bhhs\b/gi, "HHS")
    .replace(/\bml\b/gi, "ML")
    .replace(/\bmlops\b/gi, "MLOps");

  return title;
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

const jurisdictions = ["canada", "europe", "france", "usa"];
let sql = `-- Seed public_documents for Canada, Europe, France, USA jurisdictions
-- Files stored as static assets in public/documents/{jurisdiction}/
-- Generated by scripts/generate-documents-migration.mjs
`;

let totalCount = 0;

for (const jur of jurisdictions) {
  const jurPath = join(PUBLIC_DIR, jur);
  sql += `\n-- ============================================\n`;
  sql += `-- Jurisdiction: ${jur}\n`;
  sql += `-- ============================================\n\n`;

  const catDirs = readdirSync(jurPath, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d/.test(d.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (let catIdx = 0; catIdx < catDirs.length; catIdx++) {
    const catSlug = catDirs[catIdx].name;
    const catKey = `${jur}|${catSlug}`;
    const catName = CATEGORY_NAMES[catKey] || catSlug.replace(/^\d+-/, "").replace(/-/g, " ");
    const catPath = join(jurPath, catSlug);

    const files = readdirSync(catPath)
      .filter((f) => f.endsWith(".pdf") || f.endsWith(".html"))
      .sort();

    for (let docIdx = 0; docIdx < files.length; docIdx++) {
      const fileName = files[docIdx];
      const fileUrl = `/documents/${jur}/${catSlug}/${fileName}`;
      const fileType = fileName.endsWith(".html") ? "html" : "pdf";
      const title = cleanTitle(fileName);

      sql += `INSERT INTO public.public_documents (jurisdiction, category_slug, category_name, category_description, category_order, title, file_name, file_type, file_url, summary_purpose, summary_content, summary_governance, document_order, is_published)\n`;
      sql += `VALUES ('${jur}', '${escapeSQL(catSlug)}', '${escapeSQL(catName)}', '', ${catIdx}, '${escapeSQL(title)}', '${escapeSQL(fileName)}', '${fileType}', '${escapeSQL(fileUrl)}', '', '', '', ${docIdx}, true)\n`;
      sql += `ON CONFLICT (file_url) DO UPDATE SET title = EXCLUDED.title, category_name = EXCLUDED.category_name, category_order = EXCLUDED.category_order, document_order = EXCLUDED.document_order;\n`;
      totalCount++;
    }
    sql += "\n";
  }
}

writeFileSync(OUTPUT, sql, "utf-8");
console.log(`Migration generated: ${OUTPUT} (${totalCount} INSERT statements)`);
