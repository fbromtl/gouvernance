import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const SITE_URL = 'https://gouvernance.ai';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/a-propos', changefreq: 'monthly', priority: '0.8' },
  { path: '/experts', changefreq: 'monthly', priority: '0.8' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/ressources', changefreq: 'weekly', priority: '0.9' },
  { path: '/evenements', changefreq: 'weekly', priority: '0.7' },
  { path: '/rejoindre', changefreq: 'monthly', priority: '0.8' },
  { path: '/organisations', changefreq: 'monthly', priority: '0.6' },
  { path: '/actualites', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/tarifs', changefreq: 'monthly', priority: '0.7' },
  { path: '/confidentialite', changefreq: 'yearly', priority: '0.3' },
  { path: '/mentions-legales', changefreq: 'yearly', priority: '0.3' },
  { path: '/accessibilite', changefreq: 'yearly', priority: '0.3' },
];

function getArticleRoutes() {
  const articlesDir = path.join(ROOT, 'content', 'articles');

  if (!fs.existsSync(articlesDir)) {
    console.warn('Warning: content/articles/ directory not found, skipping articles.');
    return [];
  }

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));
  const routes = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');

    const slugMatch = content.match(/^slug:\s*(.+)$/m);
    const dateMatch = content.match(/^date:\s*"?([^"\n]+)"?$/m);

    if (!slugMatch) {
      console.warn(`Warning: no slug found in ${file}, skipping.`);
      continue;
    }

    const slug = slugMatch[1].trim();
    const date = dateMatch ? dateMatch[1].trim() : null;

    routes.push({
      path: `/actualites/${slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: date || null,
    });
  }

  return routes;
}

function buildUrlEntry(route) {
  let entry = '  <url>\n';
  entry += `    <loc>${SITE_URL}${route.path}</loc>\n`;
  if (route.lastmod) {
    entry += `    <lastmod>${route.lastmod}</lastmod>\n`;
  }
  entry += `    <changefreq>${route.changefreq}</changefreq>\n`;
  entry += `    <priority>${route.priority}</priority>\n`;
  entry += '  </url>';
  return entry;
}

function generate() {
  const articleRoutes = getArticleRoutes();
  const allRoutes = [...staticRoutes, ...articleRoutes];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allRoutes.map(buildUrlEntry),
    '</urlset>',
    '',
  ].join('\n');

  const distDir = path.join(ROOT, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8');

  console.log(`Sitemap generated with ${allRoutes.length} URLs (${staticRoutes.length} static + ${articleRoutes.length} articles).`);
}

generate();
