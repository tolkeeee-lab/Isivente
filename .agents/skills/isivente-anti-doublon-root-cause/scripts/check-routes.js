#!/usr/bin/env node
/**
 * check-routes.js — Garde-fou d'unification des routes Isivente
 * Vérifie qu'aucune route API parallèle, de test isolée ou hors registre n'a été créée.
 */
const fs = require("fs");
const path = require("path");

const ALLOWED_API_ROUTES = new Set([
  "/api/agent/chat",
  "/api/analytics",
  "/api/delivery",
  "/api/finances",
  "/api/higgsfield",
  "/api/leads",
  "/api/meta-ads",
  "/api/notify",
  "/api/orders",
  "/api/pixel/event",
  "/api/whatsapp/webhook",
]);

function walkRoutes(dir, baseDir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkRoutes(full, baseDir, found);
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      const rel = path.relative(baseDir, path.dirname(full)).replace(/\\/g, "/");
      found.push("/" + rel);
    }
  }
  return found;
}

const appDir = path.resolve(process.cwd(), "app");
const apiRoutes = walkRoutes(path.join(appDir, "api"), appDir).sort();

const unauthorized = apiRoutes.filter((r) => !ALLOWED_API_ROUTES.has(r));

console.log("=== AUDIT DES ROUTES API UNIFIÉES ISIVENTE ===");
console.log(`Routes API actives (${apiRoutes.length}) : ${apiRoutes.join(", ")}`);

if (unauthorized.length > 0) {
  console.error("\n❌ ROUTES HORS REGISTRE / DOUBLONS DÉTECTÉS :");
  for (const r of unauthorized) {
    console.error(`  - ${r} (unifier dans une route existante ou mettre à jour le registre après validation)`);
  }
  process.exit(1);
}

console.log("✅ 100 % des routes API sont unifiées et conformes au registre officiel (0 doublon).");
