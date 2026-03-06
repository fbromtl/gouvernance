import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const outDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svg = fs.readFileSync(svgPath, 'utf-8');
const sizes = [
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'icon-192x192.png', size: 192, maskable: false },
  { name: 'icon-512x512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
];

const browser = await puppeteer.launch();

for (const { name, size, maskable } of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size });

  const bgColor = maskable ? '#57886c' : '#f7f6f4';
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.05);
  const innerSize = size - padding * 2;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:${bgColor};">
  <div style="width:${innerSize}px;height:${innerSize}px;">${svg}</div>
</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, name), omitBackground: false });
  await page.close();
}

await browser.close();
console.log('Icons generated in public/icons/');
