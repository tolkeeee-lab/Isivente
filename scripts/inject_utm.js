/**
 * Script d'injection UTM dans toutes les landing pages Isivente.
 * Ajoute `import { useUTM }` et `const utm = useUTM()` + `...utm,` dans saveNewOrder.
 * Usage: node scripts/inject_utm.js
 */
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'components', 'features');

// Files to patch (already done: MicroscopeLanding, EyeMassagerLanding)
const targets = [
  'EraCleanLanding.tsx',
  'TurboFanLanding.tsx',
  'PeelerLanding.tsx',
  'StabilizerLanding.tsx',
  'VeilleuseLanding.tsx',
  'UmeiLanding.tsx',
  'CameraLanding.tsx',
  'TrozkLanding.tsx',
  'ProductLanding.tsx',
  'QuickOrderDrawer.tsx',
];

let patched = 0;
let skipped = 0;

for (const filename of targets) {
  const filePath = path.join(componentsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  MISSING: ${filename}`);
    skipped++;
    continue;
  }

  let src = fs.readFileSync(filePath, 'utf8');
  const original = src;
  let changes = [];

  // 1. Add useUTM import after saveNewOrder import (if not already there)
  if (!src.includes('useUTM')) {
    src = src.replace(
      /import { saveNewOrder } from "@\/lib\/ordersStorage";/,
      `import { saveNewOrder } from "@/lib/ordersStorage";\nimport { useUTM } from "@/lib/utm";`
    );
    changes.push('import');
  }

  // 2. Add `const utm = useUTM();` after the first `const router = useRouter();` or usePagePresence line
  //    We inject after the first useState or useRouter call inside the component function
  if (!src.includes('const utm = useUTM()')) {
    // Strategy A: inject after usePagePresence line
    const pagePresenceMatch = /const { recordInteraction } = usePagePresence\([^)]*\);/;
    const routerMatch = /const router = useRouter\(\);/;

    if (pagePresenceMatch.test(src)) {
      src = src.replace(pagePresenceMatch, (m) => `${m}\n  const utm = useUTM();`);
      changes.push('hook(pagePresence)');
    } else if (routerMatch.test(src)) {
      src = src.replace(routerMatch, (m) => `${m}\n  const utm = useUTM();`);
      changes.push('hook(router)');
    } else {
      // Fallback: inject after first useState inside export default function
      const stateMatch = /const \[.*\] = useState/;
      if (stateMatch.test(src)) {
        src = src.replace(stateMatch, (m) => `const utm = useUTM();\n  ${m}`);
        changes.push('hook(useState-fallback)');
      } else {
        console.log(`⚠️  ${filename}: could not find injection point for hook`);
      }
    }
  }

  // 3. Add `...utm,` before `status: "pending",` in saveNewOrder calls
  if (!src.includes('...utm,')) {
    // Match status line followed by closing }) of saveNewOrder
    const hasSpread = src.includes('...utm,');
    if (!hasSpread) {
      // Simple string replacement: inject ...utm, after every `status: "pending",`
      // that is inside a saveNewOrder call
      const newSrc = src.replace(
        /([ \t]+status: ["']pending["'],\n)([ \t]+\}\))/g,
        '$1$2'.replace('$1', '$1').replace('$2', '$2') // placeholder - use below
      );
      // Actually use a safe replace:
      src = src.replace(
        /(\n[ \t]+status: ["']pending["'],)(\n[ \t]+\}\))/g,
        (m, statusLine, closing) => `${statusLine}\n        ...utm,${closing}`
      );
      if (src !== original && !changes.includes('spread')) changes.push('spread');
    }
  }


  if (src !== original) {
    fs.writeFileSync(filePath, src, 'utf8');
    console.log(`✅ ${filename} [${changes.join(', ')}]`);
    patched++;
  } else {
    console.log(`⏭️  ${filename} — already patched or no changes needed`);
    skipped++;
  }
}

console.log(`\n📊 Résultat: ${patched} fichiers patchés, ${skipped} skippés`);
