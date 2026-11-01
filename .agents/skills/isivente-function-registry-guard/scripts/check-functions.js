/**
 * Script d'audit automatique des fonctions Isivente
 * Détecte tout doublon de fonction utilitaire/métier entre lib/, hooks/ et app/api/
 * Usage: node .agents/skills/isivente-function-registry-guard/scripts/check-functions.js
 */

const fs = require("fs");
const path = require("path");

const DIRS_TO_SCAN = ["lib", "hooks", "app/api"];
const IGNORED_ROUTE_HANDLERS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]);
const fnRegistry = new Map(); // fnName -> [{ file, line, exported }]

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
        const match = line.match(/^\s*(export\s+)?(async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/);
        if (match) {
          const isExported = Boolean(match[1]);
          const fnName = match[3];
          if (IGNORED_ROUTE_HANDLERS.has(fnName)) return;
          if (!fnRegistry.has(fnName)) {
            fnRegistry.set(fnName, []);
          }
          fnRegistry.get(fnName).push({
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
console.log("=== AUDIT DES FONCTIONS ISIVENTE (lib/, hooks/, app/api/) ===");

for (const [fnName, locations] of fnRegistry.entries()) {
  if (locations.length > 1) {
    duplicateCount++;
    console.error(
      `❌ DOUBLON DÉTECTÉ : La fonction "${fnName}" existe dans ${locations.length} fichiers :`
    );
    locations.forEach((loc) => {
      console.error(`   - ${loc.file}:${loc.line} (${loc.exported ? "export" : "interne"})`);
    });
  }
}

if (duplicateCount === 0) {
  console.log(`✅ 0 doublon de fonction détecté sur ${fnRegistry.size} fonctions analysées (lib/, hooks/, app/api/).`);
  process.exit(0);
} else {
  console.error(`⚠️ ${duplicateCount} fonction(s) en doublon à unifier immédiatement !`);
  process.exit(1);
}
