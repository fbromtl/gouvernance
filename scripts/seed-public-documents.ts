/**
 * Seed script for public document library.
 *
 * Usage:
 *   npx tsx scripts/seed-public-documents.ts
 *
 * Requires env vars:
 *   SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 *
 * Reads documents from: C:\Users\fbrom\OneDrive\Desktop\Gouvernance\RAG\
 * Copies to: ./public/documents/
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RAG_ROOT = "C:/Users/fbrom/OneDrive/Desktop/Gouvernance/RAG";
const PUBLIC_DIR = path.resolve("public/documents");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const JURISDICTION_MAP: Record<string, string> = {
  "Québec": "quebec",
  "Canada": "canada",
  "Europe": "europe",
  "France": "france",
  "USA": "usa",
};

function getFileType(filename: string): "pdf" | "html" {
  return filename.endsWith(".html") ? "html" : "pdf";
}

async function seedJurisdiction(folderName: string) {
  const jurisdiction = JURISDICTION_MAP[folderName];
  if (!jurisdiction) {
    console.log(`Skipping unknown folder: ${folderName}`);
    return;
  }

  const jurisdictionPath = path.join(RAG_ROOT, folderName);
  const entries = fs.readdirSync(jurisdictionPath, { withFileTypes: true });

  // Only process numbered directories (01-xxx, 02-xxx, etc.)
  const categoryDirs = entries
    .filter((e) => e.isDirectory() && /^\d+/.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (categoryDirs.length === 0) {
    console.log(`  No category folders found, skipping.`);
    return;
  }

  for (let catIdx = 0; catIdx < categoryDirs.length; catIdx++) {
    const catDir = categoryDirs[catIdx];
    const catPath = path.join(jurisdictionPath, catDir.name);
    const categorySlug = catDir.name.toLowerCase();
    // Create a human-readable name: "01-Declaration-Montreal" -> "Declaration Montreal"
    // For now, just clean up the folder name
    const categoryName = catDir.name
      .replace(/^\d+-/, "")
      .replace(/-/g, " ");

    // Create target directory
    const targetDir = path.join(PUBLIC_DIR, jurisdiction, categorySlug);
    fs.mkdirSync(targetDir, { recursive: true });

    const files = fs.readdirSync(catPath)
      .filter((f) => f.endsWith(".pdf") || f.endsWith(".html"))
      .sort();

    if (files.length === 0) {
      console.log(`  ${catDir.name}: no PDF/HTML files, skipping`);
      continue;
    }

    console.log(`  ${catDir.name}: ${files.length} files`);

    for (let docIdx = 0; docIdx < files.length; docIdx++) {
      const fileName = files[docIdx];
      const srcPath = path.join(catPath, fileName);
      const destPath = path.join(targetDir, fileName);
      const fileUrl = `/documents/${jurisdiction}/${categorySlug}/${fileName}`;
      const fileType = getFileType(fileName);

      // Copy file
      fs.copyFileSync(srcPath, destPath);

      // Derive a human-readable title from filename
      const title = fileName
        .replace(/^\d+-/, "")
        .replace(/\.(pdf|html)$/, "")
        .replace(/-/g, " ");

      // Insert metadata (summaries will be filled later by AI script)
      const { error: insertError } = await supabase
        .from("public_documents")
        .upsert({
          jurisdiction,
          category_slug: categorySlug,
          category_name: categoryName,
          category_description: "",
          category_order: catIdx,
          title,
          file_name: fileName,
          file_type: fileType,
          file_url: fileUrl,
          summary_purpose: "",
          summary_content: "",
          summary_governance: "",
          document_order: docIdx,
          is_published: true,
        }, {
          onConflict: "file_url",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error(`    FAIL ${fileName}: ${insertError.message}`);
      } else {
        console.log(`    OK ${fileName}`);
      }
    }
  }
}

async function main() {
  console.log("=== Seeding public document library ===\n");
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const folders = fs.readdirSync(RAG_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  for (const folder of folders) {
    console.log(`\nProcessing: ${folder}`);
    await seedJurisdiction(folder);
  }

  console.log("\n=== Done ===");
  console.log(`Files copied to: ${PUBLIC_DIR}`);
  console.log("Remember to commit the public/documents/ folder.");
}

main().catch(console.error);
