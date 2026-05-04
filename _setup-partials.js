// One-time setup: extract partials + replace markers in all HTML source files
const fs = require('fs');
const path = require('path');

const siteRoot = __dirname;

const HEADER_START = '<!-- PARTIAL: header -->';
const HEADER_END   = '<!-- END PARTIAL: header -->';
const FOOTER_START = '<!-- PARTIAL: footer -->';
const FOOTER_END   = '<!-- END PARTIAL: footer -->';
const RAW_HEADER_START = '<header class="site-header">';
const RAW_FOOTER_START = '<footer class="site-footer">';

// ── Extract partials from index.html ──────────────────────────────────────────
const indexRaw = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf8').replace(/\r\n/g, '\n');

function extract(content, start, end) {
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) return null;
  return content.slice(s + start.length, e).trim();
}

// Root partials (already on disk from first run, but redo to be safe)
const rootHeader = extract(indexRaw, HEADER_START, HEADER_END);
const rootFooter = extract(indexRaw, FOOTER_START, FOOTER_END);

if (!rootHeader || !rootFooter) {
  console.error('Could not extract root partials from index.html — it may already be processed.');
  // Partials should already be on disk from first run
} else {
  fs.mkdirSync(path.join(siteRoot, '_partials'), { recursive: true });
  fs.writeFileSync(path.join(siteRoot, '_partials', 'header.html'), rootHeader + '\n');
  fs.writeFileSync(path.join(siteRoot, '_partials', 'footer.html'), rootFooter + '\n');
  console.log('Root partials written.');
}

// Location partials from andover.html
const andoverRaw = fs.readFileSync(path.join(siteRoot, 'locations', 'andover.html'), 'utf8').replace(/\r\n/g, '\n');
const locHeader = extract(andoverRaw, HEADER_START, HEADER_END);
const locFooter = extract(andoverRaw, FOOTER_START, FOOTER_END);

if (!locHeader || !locFooter) {
  console.error('Could not extract location partials from andover.html — may already be processed.');
} else {
  fs.writeFileSync(path.join(siteRoot, '_partials', 'header-location.html'), locHeader + '\n');
  fs.writeFileSync(path.join(siteRoot, '_partials', 'footer-location.html'), locFooter + '\n');
  console.log('Location partials written.');
}

// ── Process a single HTML file ────────────────────────────────────────────────
function processFile(content) {
  // Header replacement
  if (content.includes(HEADER_START)) {
    const s = content.indexOf(HEADER_START);
    const e = content.indexOf(HEADER_END) + HEADER_END.length;
    content = content.slice(0, s) + '<!-- HEADER -->' + content.slice(e);
  } else if (content.includes(RAW_HEADER_START)) {
    const s = content.indexOf(RAW_HEADER_START);
    const e = content.indexOf('</header>', s) + '</header>'.length;
    content = content.slice(0, s) + '<!-- HEADER -->' + content.slice(e);
  }

  // Footer replacement
  if (content.includes(FOOTER_START)) {
    const s = content.indexOf(FOOTER_START);
    const e = content.indexOf(FOOTER_END) + FOOTER_END.length;
    content = content.slice(0, s) + '<!-- FOOTER -->' + content.slice(e);
  } else if (content.includes(RAW_FOOTER_START)) {
    const s = content.indexOf(RAW_FOOTER_START);
    const footerClose = content.indexOf('</footer>', s) + '</footer>'.length;
    // Check for trailing year script right after </footer>
    const afterFooter = content.slice(footerClose);
    const yearScript = afterFooter.match(/^\s*<script>\s*document\.getElementById\('footer-year'\)[^<]+<\/script>/);
    const e = yearScript ? footerClose + yearScript[0].length : footerClose;
    content = content.slice(0, s) + '<!-- FOOTER -->' + content.slice(e);
  }

  return content;
}

// ── Root HTML files ───────────────────────────────────────────────────────────
const rootFiles = fs.readdirSync(siteRoot).filter(f => f.endsWith('.html'));

for (const file of rootFiles) {
  const fp = path.join(siteRoot, file);
  let c = fs.readFileSync(fp, 'utf8').replace(/\r\n/g, '\n');
  c = processFile(c);

  const hasHeader    = c.includes('<!-- HEADER -->');
  const hasFooter    = c.includes('<!-- FOOTER -->');
  const leakedHeader = c.includes(RAW_HEADER_START);
  const leakedFooter = c.includes(RAW_FOOTER_START);

  if (leakedHeader) console.warn(`  WARNING: raw <header> still present in ${file}`);
  if (leakedFooter) console.warn(`  WARNING: raw <footer> still present in ${file}`);

  fs.writeFileSync(fp, c);
  console.log(`Root: ${file}  HEADER=${hasHeader}  FOOTER=${hasFooter}`);
}

// ── Location HTML files ───────────────────────────────────────────────────────
const locDir = path.join(siteRoot, 'locations');
const locFiles = fs.readdirSync(locDir).filter(f => f.endsWith('.html'));

for (const file of locFiles) {
  const fp = path.join(locDir, file);
  let c = fs.readFileSync(fp, 'utf8').replace(/\r\n/g, '\n');
  c = processFile(c);

  const hasHeader    = c.includes('<!-- HEADER -->');
  const hasFooter    = c.includes('<!-- FOOTER -->');
  const leakedHeader = c.includes(RAW_HEADER_START);
  const leakedFooter = c.includes(RAW_FOOTER_START);

  if (leakedHeader) console.warn(`  WARNING: raw <header> still in locations/${file}`);
  if (leakedFooter) console.warn(`  WARNING: raw <footer> still in locations/${file}`);

  fs.writeFileSync(fp, c);
  console.log(`Location: ${file}  HEADER=${hasHeader}  FOOTER=${hasFooter}`);
}

console.log('\nSetup complete!');
