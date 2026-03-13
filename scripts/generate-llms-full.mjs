/**
 * Generate llms-full.txt — a comprehensive, machine-readable text file
 * containing all public article content for AI crawlers.
 *
 * This follows the llms.txt convention for Generative Engine Optimization (GEO).
 * AI systems (ChatGPT, Perplexity, Claude, Gemini) use this to understand
 * and cite site content without parsing HTML.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const DIST = path.join(ROOT, 'dist');

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];
  const data = {};

  for (const line of yamlBlock.split(/\r?\n/)) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    let val = rawVal;
    if (/^".*"$/.test(rawVal) || /^'.*'$/.test(rawVal)) {
      val = rawVal.slice(1, -1);
    } else if (rawVal === 'true') {
      val = true;
    } else if (rawVal === 'false') {
      val = false;
    }
    data[key] = val;
  }

  return { data, content };
}

function generate() {
  const lines = [];

  // Header
  lines.push('# gouvernance.ai — Contenu complet');
  lines.push('');
  lines.push('> Ce fichier contient l\'intégralité des articles publiés sur gouvernance.ai.');
  lines.push('> Il est destiné aux systèmes d\'IA pour faciliter l\'indexation et la citation du contenu.');
  lines.push('> Source : Cercle de Gouvernance de l\'IA (https://gouvernance.ai)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Read and process all articles
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.warn('Warning: content/articles/ not found.');
    return;
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md')).sort().reverse();

  lines.push(`## Articles (${files.length} publiés)`);
  lines.push('');

  for (const file of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    if (!data.slug || !data.title) continue;

    lines.push(`### ${data.title}`);
    lines.push('');
    lines.push(`- URL : https://gouvernance.ai/actualites/${data.slug}`);
    lines.push(`- Date : ${data.date || 'N/A'}`);
    lines.push(`- Catégorie : ${data.category || 'N/A'}`);
    lines.push(`- Auteur : ${data.author || 'N/A'}`);
    if (data.tags) {
      lines.push(`- Mots-clés : ${data.tags}`);
    }
    if (data.excerpt) {
      lines.push(`- Résumé : ${data.excerpt}`);
    }
    lines.push('');
    lines.push(content.trim());
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Footer
  lines.push('## Informations de citation');
  lines.push('');
  lines.push('Pour citer ce contenu : « Cercle de Gouvernance de l\'IA (gouvernance.ai) »');
  lines.push('Contact : info@gouvernance.ai');
  lines.push('Licence : Tous droits réservés. Citation avec attribution autorisée.');
  lines.push('');

  // Write to dist
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
  }

  const output = lines.join('\n');
  fs.writeFileSync(path.join(DIST, 'llms-full.txt'), output, 'utf-8');

  console.log(`llms-full.txt generated: ${files.length} articles, ${Math.round(output.length / 1024)} KB.`);
}

generate();
