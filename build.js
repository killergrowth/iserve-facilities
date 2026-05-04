// build.js — IServe Facilities static-HTML build system
// Usage: node build.js
// Reads _partials/, processes HTML source files, copies assets → dist/

const fs   = require('fs');
const path = require('path');

const ROOT    = __dirname;
const DIST    = path.join(ROOT, 'dist');
const PARTIAL = path.join(ROOT, '_partials');

// ── Load partials ─────────────────────────────────────────────────────────────
const partials = {
  header:         fs.readFileSync(path.join(PARTIAL, 'header.html'),          'utf8'),
  footer:         fs.readFileSync(path.join(PARTIAL, 'footer.html'),          'utf8'),
  headerLocation: fs.readFileSync(path.join(PARTIAL, 'header-location.html'), 'utf8'),
  footerLocation: fs.readFileSync(path.join(PARTIAL, 'footer-location.html'), 'utf8'),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function processHTML(content, header, footer) {
  if (header) content = content.replace('<!-- HEADER -->', header);
  if (footer) content = content.replace('<!-- FOOTER -->', footer);
  return content;
}

// ── Create dist ───────────────────────────────────────────────────────────────
fs.mkdirSync(DIST, { recursive: true });

// ── Copy static assets ────────────────────────────────────────────────────────
for (const dir of ['css', 'js', 'images']) {
  copyDir(path.join(ROOT, dir), path.join(DIST, dir));
  console.log(`Copied: ${dir}/`);
}

// ── Build root HTML files ─────────────────────────────────────────────────────
const rootFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let rootCount = 0;

for (const file of rootFiles) {
  let content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  content = processHTML(content, partials.header, partials.footer);
  fs.writeFileSync(path.join(DIST, file), content);
  console.log(`Built: ${file}`);
  rootCount++;
}

// ── Build locations/ HTML files ───────────────────────────────────────────────
const LOC_SRC  = path.join(ROOT, 'locations');
const LOC_DIST = path.join(DIST, 'locations');
fs.mkdirSync(LOC_DIST, { recursive: true });

const locFiles = fs.readdirSync(LOC_SRC).filter(f => f.endsWith('.html'));
let locCount = 0;

for (const file of locFiles) {
  let content = fs.readFileSync(path.join(LOC_SRC, file), 'utf8');
  content = processHTML(content, partials.headerLocation, partials.footerLocation);
  fs.writeFileSync(path.join(LOC_DIST, file), content);
  console.log(`Built: locations/${file}`);
  locCount++;
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nBuild complete! ${rootCount} root pages + ${locCount} location pages → dist/`);
