/**
 * Prerender public routes to static HTML for SEO.
 *
 * Uses Puppeteer (already in devDependencies) to visit each public route
 * on the built SPA, wait for React to render + useEffect meta updates,
 * then capture the full HTML and write it to dist/.
 *
 * Crawlers that don't execute JavaScript (LinkedIn, Facebook, Twitter, Bing)
 * will receive the pre-rendered HTML with all meta tags and content.
 */

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ARTICLES_DIR = path.join(ROOT, 'content', 'articles');
const PORT = 4173;

/* ------------------------------------------------------------------ */
/*  Route discovery                                                    */
/* ------------------------------------------------------------------ */

function getArticleSlugs() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const content = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
      const match = content.match(/^slug:\s*(.+)$/m);
      return match ? match[1].trim() : null;
    })
    .filter(Boolean);
}

function getRoutes() {
  const staticRoutes = [
    '/',
    '/a-propos',
    '/experts',
    '/ressources',
    '/rejoindre',
    '/actualites',
    '/contact',
    '/tarifs',
    '/diagnostic',
    '/fonctionnalites',
    '/membres-honoraires',
    '/confidentialite',
    '/mentions-legales',
    '/accessibilite',
  ];

  const articleRoutes = getArticleSlugs().map((slug) => `/actualites/${slug}`);
  return [...staticRoutes, ...articleRoutes];
}

/* ------------------------------------------------------------------ */
/*  Minimal static file server for dist/                               */
/* ------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(DIST, urlPath);

      // Directory → try index.html
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      // SPA fallback
      if (!fs.existsSync(filePath)) {
        filePath = path.join(DIST, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME[ext] || 'application/octet-stream';

      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(PORT, () => {
      console.log(`  Server: http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function prerender() {
  // Allow skipping prerendering via env variable (useful for quick deploys)
  if (process.env.SKIP_PRERENDER === 'true') {
    console.log('Prerendering skipped (SKIP_PRERENDER=true).');
    return;
  }

  const routes = getRoutes();
  console.log(`\nPrerendering ${routes.length} routes...\n`);

  // 1. Save original SPA shell as fallback for non-prerendered routes
  const spaPath = path.join(DIST, 'index.html');
  const fallbackPath = path.join(DIST, '_spa.html');
  fs.copyFileSync(spaPath, fallbackPath);
  console.log('  Saved SPA fallback: _spa.html');

  // 2. Ensure Chrome is installed (required on CI environments like Netlify)
  try {
    console.log('  Installing Chrome for Puppeteer...');
    execSync('npx puppeteer browsers install chrome', { stdio: 'pipe' });
    console.log('  Chrome installed.');
  } catch {
    console.log('  Chrome install skipped (may already be available).');
  }

  // 3. Start local server
  const server = await startServer();

  // 4. Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  let ok = 0;
  let fail = 0;

  for (const route of routes) {
    try {
      const page = await browser.newPage();

      // Block heavy resources — we only need DOM + meta tags
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate and wait for network to stabilize
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for React to render (h1 or h2 appears after lazy-load + render)
      await page.waitForSelector('h1, h2', { timeout: 15000 });

      // Small delay for useEffect-based meta tag updates
      await new Promise((r) => setTimeout(r, 500));

      // Capture rendered HTML
      let html = await page.content();

      // Remove Puppeteer-specific attributes and clean up
      html = html.replace(/ data-new-gr-c-s-check-loaded="[^"]*"/g, '');
      html = html.replace(/ data-gr-ext-installed="[^"]*"/g, '');

      // Write to correct path
      const outDir = route === '/' ? DIST : path.join(DIST, route);
      fs.mkdirSync(outDir, { recursive: true });

      const outFile = route === '/' ? path.join(DIST, 'index.html') : path.join(outDir, 'index.html');
      fs.writeFileSync(outFile, html, 'utf-8');

      console.log(`  OK  ${route}`);
      ok++;

      await page.close();
    } catch (err) {
      console.error(`  FAIL ${route}: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\nPrerendering complete: ${ok} OK, ${fail} failed.\n`);

  if (fail > 0) {
    process.exit(1);
  }
}

prerender().catch((err) => {
  console.error(`\nPrerendering failed: ${err.message}`);
  console.error('The site will still work as a standard SPA.');
  console.error('Set SKIP_PRERENDER=true to skip this step.\n');
  process.exit(1);
});
