/**
 * Converts "Gouvernance" text to SVG paths using Crimson Text Bold.
 * Outputs logo.svg, logo-light.svg, and favicon.svg with flattened paths.
 */
import opentype from "opentype.js";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "../public");

// Load Crimson Text Bold
const font = opentype.loadSync(resolve(__dirname, "crimson-text-bold.ttf"));

// ── Logo ────────────────────────────────────────────────────────────
const fontSize = 36;
const text = "Gouvernance";
const path = font.getPath(text, 0, 32, fontSize);
const pathData = path.toPathData(2);

// Measure text width via font.getAdvanceWidth
const textWidth = font.getAdvanceWidth(text, fontSize);
const dotCx = Math.round(textWidth + 12);
const dotCy = 29;
const dotR = 5;
const svgWidth = dotCx + dotR + 4;

function makeLogo(fill, filename) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="40" viewBox="0 0 ${svgWidth} 40" fill="none">
  <path d="${pathData}" fill="${fill}"/>
  <circle cx="${dotCx}" cy="${dotCy}" r="${dotR}" fill="#57886c"/>
</svg>
`;
  writeFileSync(resolve(PUBLIC, filename), svg);
  console.log(`✓ ${filename} (${svgWidth}×40, text width=${Math.round(textWidth)})`);
}

makeLogo("#1a1a1a", "logo.svg");
makeLogo("#ffffff", "logo-light.svg");

// ── Favicon (32×32) ─────────────────────────────────────────────────
const fPath = font.getPath("G", 2, 26, 28);
const fPathData = fPath.toPathData(2);
const fTextWidth = font.getAdvanceWidth("G", 28);
const fDotCx = Math.round(2 + fTextWidth + 4);
const fDotCy = 24;
const fDotR = 3.5;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="${fPathData}" fill="#1a1a1a"/>
  <circle cx="${fDotCx}" cy="${fDotCy}" r="${fDotR}" fill="#57886c"/>
</svg>
`;
writeFileSync(resolve(PUBLIC, "favicon.svg"), faviconSvg);
console.log(`✓ favicon.svg (32×32)`);
