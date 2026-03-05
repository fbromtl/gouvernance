/**
 * build-templates.mjs
 *
 * Converts all DOCX template files from the source directory into:
 *   - src/data/templates-index.json  (metadata index)
 *   - public/templates/{id}.html    (HTML content per document)
 *   - public/templates/docx/{file}  (copy of original DOCX)
 *
 * Usage: node scripts/build-templates.mjs
 */

import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import JSZip from "jszip";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const SOURCE_DIR = path.resolve(
  PROJECT_ROOT,
  "..",
  "ModeleDoc",
  "Modeles_Gouvernance_IA"
);

const OUT_INDEX = path.join(PROJECT_ROOT, "src", "data", "templates-index.json");
const OUT_HTML_DIR = path.join(PROJECT_ROOT, "public", "templates");
const OUT_DOCX_DIR = path.join(PROJECT_ROOT, "public", "templates", "docx");

// ---------------------------------------------------------------------------
// Category mapping by document number
// ---------------------------------------------------------------------------

const CATEGORY_RANGES = [
  { range: [1, 6], slug: "gouvernance-strategique", label: "Gouvernance stratégique" },
  { range: [7, 12], slug: "ethique-valeurs", label: "Éthique & Valeurs" },
  { range: [13, 20], slug: "utilisation-pratiques", label: "Utilisation & Pratiques" },
  { range: [21, 28], slug: "securite-confidentialite", label: "Sécurité & Confidentialité" },
  { range: [29, 36], slug: "gestion-risques", label: "Gestion des risques" },
  { range: [37, 44], slug: "conformite-legale", label: "Conformité & Légale" },
  { range: [45, 50], slug: "approvisionnement", label: "Approvisionnement" },
  { range: [51, 57], slug: "rh-formation", label: "RH & Formation" },
  { range: [58, 66], slug: "documentation-technique", label: "Documentation technique" },
  { range: [67, 70], slug: "propriete-intellectuelle", label: "Propriété intellectuelle" },
  { range: [71, 75], slug: "qualite-amelioration", label: "Qualité & Amélioration" },
  { range: [76, 80], slug: "communication-changement", label: "Communication & Changement" },
];

// ---------------------------------------------------------------------------
// Type detection patterns
// ---------------------------------------------------------------------------

const TYPE_PATTERNS = [
  { pattern: /politique/i, type: "politique", label: "Politique" },
  { pattern: /charte/i, type: "charte", label: "Charte" },
  { pattern: /guide/i, type: "guide", label: "Guide" },
  { pattern: /plan/i, type: "plan", label: "Plan" },
  { pattern: /registre/i, type: "registre", label: "Registre" },
  { pattern: /proc[eé]dure/i, type: "procedure", label: "Procédure" },
  { pattern: /cadre/i, type: "cadre", label: "Cadre" },
  { pattern: /matrice/i, type: "matrice", label: "Matrice" },
  { pattern: /grille/i, type: "grille", label: "Grille" },
  { pattern: /formulaire|attestation/i, type: "formulaire", label: "Formulaire" },
  { pattern: /catalogue/i, type: "catalogue", label: "Catalogue" },
  { pattern: /fiche/i, type: "fiche", label: "Fiche" },
  { pattern: /checklist/i, type: "checklist", label: "Checklist" },
  { pattern: /rapport/i, type: "rapport", label: "Rapport" },
  { pattern: /faq/i, type: "faq", label: "FAQ" },
  { pattern: /journal/i, type: "journal", label: "Journal" },
  { pattern: /strat[eé]gie/i, type: "plan", label: "Plan" },
  { pattern: /processus/i, type: "procedure", label: "Procédure" },
  { pattern: /programme/i, type: "plan", label: "Plan" },
  { pattern: /code/i, type: "charte", label: "Charte" },
  { pattern: /principes/i, type: "cadre", label: "Cadre" },
  { pattern: /crit[eè]res/i, type: "cadre", label: "Cadre" },
  { pattern: /mod[eè]le|retour/i, type: "formulaire", label: "Formulaire" },
  { pattern: /inventaire/i, type: "registre", label: "Registre" },
  { pattern: /tableau/i, type: "matrice", label: "Matrice" },
];

// ---------------------------------------------------------------------------
// Framework detection patterns
// ---------------------------------------------------------------------------

const FRAMEWORKS = [
  { pattern: /loi\s*25/i, label: "Loi 25" },
  { pattern: /C-27|LIAD|AIDA/i, label: "C-27 / AIDA" },
  { pattern: /EU\s*AI\s*Act|AI\s*Act/i, label: "EU AI Act" },
  { pattern: /ISO[\s/]*42001/i, label: "ISO 42001" },
  { pattern: /NIST[\s_]*AI[\s_]*RMF/i, label: "NIST AI RMF" },
  { pattern: /RGPD|GDPR/i, label: "RGPD" },
  { pattern: /OCDE|OECD/i, label: "OCDE" },
  { pattern: /ISO[\s/]*27001/i, label: "ISO 27001" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Turn a filename like "02-Politique_Gouvernance_IA.docx" into a slug. */
function toSlug(name) {
  return name
    .replace(/\.docx$/i, "")
    .replace(/_/g, "-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/** Build a human-readable title from the filename. */
function toTitle(name) {
  return name
    .replace(/\.docx$/i, "")
    .replace(/^\d+-/, "") // remove leading number
    .replace(/_/g, " ");
}

/** Return the category object for a given document number. */
function getCategory(num) {
  for (const cat of CATEGORY_RANGES) {
    if (num >= cat.range[0] && num <= cat.range[1]) {
      return { slug: cat.slug, label: cat.label };
    }
  }
  return { slug: "autre", label: "Autre" };
}

/** Detect document type from the title string. */
function detectType(title) {
  for (const tp of TYPE_PATTERNS) {
    if (tp.pattern.test(title)) {
      return { type: tp.type, label: tp.label };
    }
  }
  return { type: "document", label: "Document" };
}

/** Detect referenced frameworks inside HTML content. */
function detectFrameworks(html) {
  const found = [];
  for (const fw of FRAMEWORKS) {
    if (fw.pattern.test(html)) {
      found.push(fw.label);
    }
  }
  return [...new Set(found)];
}

/** Extract the first meaningful paragraph text from HTML as a description. */
function extractDescription(html) {
  const paragraphs = html.matchAll(/<p[^>]*>(.*?)<\/p>/gis);
  for (const match of paragraphs) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    // Skip empty, placeholders, and very short fragments
    if (!text || text.length < 20) continue;
    if (/^\[.*\]$/.test(text)) continue; // skip [NOM_ORGANISATION] etc.
    // Truncate to ~200 chars
    return text.length > 200 ? text.slice(0, 200).replace(/\s+\S*$/, "…") : text;
  }
  return "";
}

/**
 * Sanitize a DOCX buffer by removing invalid XML tags (e.g. <0/>).
 * Some DOCX generators insert tags whose names start with a digit,
 * which is invalid per the XML spec and causes xmldom to choke.
 * We unzip, clean all .xml/.rels files, then repack.
 */
async function sanitizeDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  let patched = false;

  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir) continue;
    if (!/\.(xml|rels)$/i.test(name)) continue;

    let content = await zip.file(name).async("string");
    // Remove self-closing tags whose name starts with a digit: <0/>, <1/>, etc.
    const cleaned = content.replace(/<\d+\s*\/>/g, "");
    // Remove open/close tags whose name starts with a digit: <0>...</0>
    const cleaned2 = cleaned.replace(/<\/?\d+[^>]*>/g, "");

    if (cleaned2 !== content) {
      zip.file(name, cleaned2);
      patched = true;
    }
  }

  if (!patched) return buffer; // no changes needed

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== build-templates ===");
  console.log(`Source : ${SOURCE_DIR}`);

  // 1. Verify source directory exists
  try {
    await fs.access(SOURCE_DIR);
  } catch {
    console.error(`ERROR: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // 2. Collect all .docx files recursively
  const docxFiles = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && /\.docx$/i.test(entry.name) && !entry.name.startsWith("~")) {
        docxFiles.push(full);
      }
    }
  }

  await walk(SOURCE_DIR);
  docxFiles.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));

  console.log(`Found ${docxFiles.length} DOCX files\n`);

  if (docxFiles.length === 0) {
    console.error("ERROR: No DOCX files found. Aborting.");
    process.exit(1);
  }

  // 3. Create output directories
  await fs.mkdir(path.dirname(OUT_INDEX), { recursive: true });
  await fs.mkdir(OUT_HTML_DIR, { recursive: true });
  await fs.mkdir(OUT_DOCX_DIR, { recursive: true });

  // 4. Process each file
  const index = [];
  let successCount = 0;
  let errorCount = 0;

  for (const filePath of docxFiles) {
    const filename = path.basename(filePath);
    const numMatch = filename.match(/^(\d+)-/);

    if (!numMatch) {
      console.warn(`  SKIP (no number prefix): ${filename}`);
      errorCount++;
      continue;
    }

    const num = parseInt(numMatch[1], 10);
    const id = toSlug(filename);
    const title = toTitle(filename);
    const category = getCategory(num);
    const typeInfo = detectType(title);

    try {
      // Convert DOCX to HTML (with sanitization fallback for malformed XML)
      const rawBuffer = await fs.readFile(filePath);
      let result;
      try {
        result = await mammoth.convertToHtml({ buffer: rawBuffer });
      } catch {
        // Attempt sanitization: remove invalid XML tags (e.g. <0/>)
        console.warn(`  SANITIZE [${filename}]: cleaning malformed XML...`);
        const cleanBuffer = await sanitizeDocx(rawBuffer);
        result = await mammoth.convertToHtml({ buffer: cleanBuffer });
      }

      if (result.messages.length > 0) {
        const warnings = result.messages.filter((m) => m.type === "warning");
        if (warnings.length > 0) {
          console.warn(`  WARN [${filename}]: ${warnings.length} conversion warning(s)`);
        }
      }

      const html = result.value;
      const description = extractDescription(html);
      const frameworks = detectFrameworks(html);

      // Write HTML file
      const htmlPath = path.join(OUT_HTML_DIR, `${id}.html`);
      await fs.writeFile(htmlPath, html, "utf-8");

      // Copy original DOCX
      const docxDest = path.join(OUT_DOCX_DIR, filename);
      await fs.copyFile(filePath, docxDest);

      // Build metadata entry
      index.push({
        id,
        number: num,
        title,
        filename,
        description,
        category: category.slug,
        categoryLabel: category.label,
        type: typeInfo.type,
        typeLabel: typeInfo.label,
        frameworks,
        htmlPath: `/templates/${id}.html`,
        docxPath: `/templates/docx/${filename}`,
      });

      successCount++;
      console.log(`  [${String(num).padStart(2, "0")}] ${title}`);
    } catch (err) {
      console.error(`  ERROR [${filename}]: ${err.message}`);
      errorCount++;
    }
  }

  // 5. Sort index by number and write JSON
  index.sort((a, b) => a.number - b.number);
  await fs.writeFile(OUT_INDEX, JSON.stringify(index, null, 2), "utf-8");

  // 6. Summary
  console.log(`\n=== Done ===`);
  console.log(`  Success : ${successCount}`);
  console.log(`  Errors  : ${errorCount}`);
  console.log(`  Index   : ${OUT_INDEX}`);
  console.log(`  HTML    : ${OUT_HTML_DIR}/ (${successCount} files)`);
  console.log(`  DOCX    : ${OUT_DOCX_DIR}/ (${successCount} files)`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
