const sharp = require('sharp');
const path = require('path');

async function createOverlay1080() {
  const width = 1080;
  const height = 1080;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient pour le bandeau du haut -->
        <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.95" />
          <stop offset="70%" stop-color="#0f172a" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
        </linearGradient>

        <!-- Gradient pour le bandeau du bas -->
        <linearGradient id="botGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#020617" stop-opacity="0.98" />
          <stop offset="70%" stop-color="#0f172a" stop-opacity="0.90" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
        </linearGradient>

        <!-- Badge CTA Orange -->
        <linearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ea580c" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>

      <!-- 🟢 BANDEAU SUPÉRIEUR HAUTE VISIBILITÉ -->
      <rect x="0" y="0" width="${width}" height="190" fill="url(#topGrad)" />

      <!-- Badge "EN ACTION" -->
      <g transform="translate(440, 25)">
        <rect x="0" y="0" width="200" height="34" rx="17" fill="#030712" fill-opacity="0.8" stroke="#334155" stroke-width="1.5" />
        <circle cx="22" cy="17" r="5" fill="#22c55e" />
        <text x="35" y="23" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" letter-spacing="1">TEST EN DIRECT</text>
      </g>

      <!-- Titre Display Accrocheur -->
      <text x="540" y="105" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
        MICROSCOPE NUMÉRIQUE HD 1000X
      </text>

      <!-- Sous-titre -->
      <text x="540" y="145" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" letter-spacing="0.5">
        Écran Couleur LCD 2.0" • Zoom Réel Sans Fil
      </text>

      <!-- 🔴 BANDEAU INFÉRIEUR (OFFRE & CTA COD) -->
      <rect x="0" y="860" width="${width}" height="220" fill="url(#botGrad)" />

      <!-- Bloc Prix & Réassurance -->
      <g transform="translate(90, 895)">
        <!-- Bouton CTA Principal -->
        <rect x="0" y="0" width="900" height="74" rx="20" fill="url(#ctaGrad)" stroke="#ffedd5" stroke-width="2" />
        <text x="450" y="47" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" fill="#ffffff" letter-spacing="0.5">
          OFFRE SPÉCIALE : 29 900 FCFA
        </text>
      </g>

      <!-- Mention Réassurance Finale -->
      <text x="540" y="1025" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold" fill="#e2e8f0" letter-spacing="0.5">
        LIVRAISON 24H EXPRESS • PAIEMENT AU LIVREUR APRÈS VÉRIFICATION
      </text>
    </svg>
  `;

  const outPath = path.join(__dirname, 'ad_overlay_square.png');
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath);
  console.log('Overlay generated:', outPath);
}

createOverlay1080();
