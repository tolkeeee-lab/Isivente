const fs = require('fs');
const path = require('path');

const defaultCatalogPath = path.join(__dirname, '..', 'lib', 'defaultCatalog.ts');
const pageSlugPath = path.join(__dirname, '..', 'app', 'p', '[slug]', 'page.tsx');
const upsellConfigPath = path.join(__dirname, '..', 'lib', 'upsellConfig.ts');

const defaultCatalog = fs.readFileSync(defaultCatalogPath, 'utf8');
const pageSlug = fs.readFileSync(pageSlugPath, 'utf8');
const upsellConfig = fs.readFileSync(upsellConfigPath, 'utf8');

console.log('=== AUDIT DU CATALOGUE VS ROUTEUR ===');

// Extract slugs from defaultCatalog
const catalogSlugMatches = [...defaultCatalog.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
console.log('Produits dans DEFAULT_CATALOG:', catalogSlugMatches);

// Extract slugs handled in app/p/[slug]/page.tsx
const handledCases = [...pageSlug.matchAll(/case\s*["']([^"']+)["']:/g)].map(m => m[1]);
console.log('Cases gérés dans ProductPage switch:', handledCases);

const staticParamsMatches = [...pageSlug.matchAll(/\{\s*slug:\s*["']([^"']+)["']\s*\}/g)].map(m => m[1]);
console.log('Slugs dans generateStaticParams:', staticParamsMatches);

const unhandled = catalogSlugMatches.filter(s => !handledCases.includes(s));
console.log('\n❌ Slugs du catalogue NON GÉRÉS par le routeur (Erreur 404 automatique) :', unhandled);

// Check Upsell Config
console.log('\n=== AUDIT DES UPSELLS ===');
catalogSlugMatches.forEach(slug => {
  if (!upsellConfig.includes(`"${slug}"`) && !upsellConfig.includes(`'${slug}'`)) {
    console.log(`  ⚠️ Produit "${slug}" absent de upsellConfig.ts`);
  } else {
    console.log(`  ✓ Produit "${slug}" présent dans upsellConfig.ts`);
  }
});
