/**
 * Script d'audit automatique des fonctions et constantes Isivente
 * Détecte tout doublon de fonction (function + arrow) et de constante globale entre lib/, hooks/ et app/api/
 * Usage: node .agents/skills/isivente-function-registry-guard/scripts/check-functions.js
 */

const fs = require("fs");
const path = require("path");

const DIRS_TO_SCAN = ["lib", "hooks", "app/api"];
const IGNORED_NAMES = new Set([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
  "dynamic",
  "runtime",
  "maxDuration",
]);

const fnRegistry = new Map(); // fnName -> [{ file, line, exported }]
const constRegistry = new Map(); // constName -> [{ file, line, exported }]

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        const fnMatch = line.match(/^\s*(export\s+)?(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/);
        if (fnMatch && !IGNORED_NAMES.has(fnMatch[3])) {
          const isExported = Boolean(fnMatch[1]);
          const fnName = fnMatch[3];
          if (!fnRegistry.has(fnName)) fnRegistry.set(fnName, []);
          fnRegistry.get(fnName).push({
            file: fullPath.replace(/\\/g, "/"),
            line: idx + 1,
            exported: isExported,
          });
        }

        const arrowMatch = line.match(
          /^\s*(export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*)?\([^)]*\)\s*=>/
        );
        if (arrowMatch && !IGNORED_NAMES.has(arrowMatch[2])) {
          const isExported = Boolean(arrowMatch[1]);
          const fnName = arrowMatch[2];
          if (!fnRegistry.has(fnName)) fnRegistry.set(fnName, []);
          fnRegistry.get(fnName).push({
            file: fullPath.replace(/\\/g, "/"),
            line: idx + 1,
            exported: isExported,
          });
        }

        const constMatch = line.match(/^\s*(export\s+)?const\s+([A-Z0-9_]{3,})\s*=/);
        if (constMatch && !IGNORED_NAMES.has(constMatch[2])) {
          const isExported = Boolean(constMatch[1]);
          const constName = constMatch[2];
          if (!constRegistry.has(constName)) constRegistry.set(constName, []);
          constRegistry.get(constName).push({
            file: fullPath.replace(/\\/g, "/"),
            line: idx + 1,
            exported: isExported,
          });
        }
      });
    }
  }
}

DIRS_TO_SCAN.forEach(scanDir);

let duplicateCount = 0;
console.log("=== AUDIT DES FONCTIONS & CONSTANTES ISIVENTE (lib/, hooks/, app/api/) ===");

for (const [fnName, locations] of fnRegistry.entries()) {
  if (locations.length > 1) {
    duplicateCount++;
    console.error(
      `❌ FONCTION EN DOUBLON : "${fnName}" existe dans ${locations.length} fichiers :`
    );
    locations.forEach((loc) => {
      console.error(`   - ${loc.file}:${loc.line} (${loc.exported ? "export" : "interne"})`);
    });
  }
}

for (const [constName, locations] of constRegistry.entries()) {
  if (locations.length > 1) {
    duplicateCount++;
    console.error(
      `❌ CONSTANTE EN DOUBLON : "${constName}" existe dans ${locations.length} fichiers :`
    );
    locations.forEach((loc) => {
      console.error(`   - ${loc.file}:${loc.line} (${loc.exported ? "export" : "interne"})`);
    });
  }
}

if (duplicateCount === 0) {
  console.log(
    `✅ 0 doublon détecté sur ${fnRegistry.size} fonctions et ${constRegistry.size} constantes analysées (lib/, hooks/, app/api/).`
  );
  process.exit(0);
} else {
  console.error(`⚠️ ${duplicateCount} élément(s) en doublon à unifier immédiatement !`);
  process.exit(1);
}
