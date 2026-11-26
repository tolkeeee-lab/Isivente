"use client";

import React from "react";
import dynamic from "next/dynamic";

const LANDING_LOADERS: Record<string, React.ComponentType<any>> = {
  cubicraft: dynamic(() => import("@/components/features/CubiCraftLanding")),
  "savon-repousse": dynamic(() => import("@/components/features/SavonRepousseLanding")),
  "voiture-camera": dynamic(() => import("@/components/features/VoitureCameraLanding")),
  umei: dynamic(() => import("@/components/features/UmeiLanding")),
  peeler: dynamic(() => import("@/components/features/PeelerLanding")),
  "masseur-oculaire": dynamic(() => import("@/components/features/EyeMassagerLanding")),
  microscope: dynamic(() => import("@/components/features/MicroscopeLanding")),
  camera: dynamic(() => import("@/components/features/CameraLanding")),
  trozk: dynamic(() => import("@/components/features/TrozkLanding")),
  stabilisateur: dynamic(() => import("@/components/features/StabilisateurLanding")),
  eraclean: dynamic(() => import("@/components/features/EraCleanLanding")),
  turbofan: dynamic(() => import("@/components/features/TurboFanLanding")),
  veilleuse: dynamic(() => import("@/components/features/VeilleuseLanding")),
  "mini-lave-linge": dynamic(() => import("@/components/features/MiniLaveLingeLanding")),
  matelas: dynamic(() => import("@/components/features/MatelasLanding")),
  "sourire-eclatant": dynamic(() => import("@/components/features/SourireEclatantLanding")),
  "projecteur-noel": dynamic(() => import("@/components/features/ProjecteurNoelLanding")),
  "equilibre-feminin": dynamic(() => import("@/components/features/ProbioticGummiesLanding")),
  "bracelet-main": dynamic(() => import("@/components/features/BraceletMainLanding")),
  "stylo-3d": dynamic(() => import("@/components/features/Stylo3DLanding")),
  "carte-du-monde": dynamic(() => import("@/components/features/CarteDuMondeLanding")),
  capsacare: dynamic(() => import("@/components/features/CapsaCareLanding")),
  odoraway: dynamic(() => import("@/components/features/OdorAwayLanding")),
  "duo-bracelets-coeur": dynamic(() => import("@/components/features/DuoBraceletsCoeurLanding")),
  "pare-soleil": dynamic(() => import("@/components/features/ParesoleilLanding")),
  shilajit: dynamic(() => import("@/components/features/ShilajitLanding")),
  "filtre-eau": dynamic(() => import("@/components/features/FiltreEauLanding")),
  "trousse-biometrique": dynamic(() => import("@/components/features/TrousseBiometriqueLanding")),
  digestigum: dynamic(() => import("@/components/features/DigestiGumLanding")),
  "calendrier-3d": dynamic(() => import("@/components/features/Calendrier3DLanding")),
  "the-5-tresors": dynamic(() => import("@/components/features/The5TresorsLanding")),
  "starlight-chargeur": dynamic(() => import("@/components/features/StarlightLanding")),
  "likel-rite": dynamic(() => import("@/components/features/LikelRiteLanding")),
  "game-stick-4k": dynamic(() => import("@/components/features/GameStickLanding")),
  r36s: dynamic(() => import("@/components/features/R36SLanding")),
  "moustiquaire-porte": dynamic(() => import("@/components/features/MoustiquairePorteLanding")),
  "masseur-vibrant": dynamic(() => import("@/components/features/MasseurVibrantLanding")),
  "coussin-masseur": dynamic(() => import("@/components/features/CoussinMasseurLanding")),
  "masseur-genou": dynamic(() => import("@/components/features/MasseurGenouLanding")),
};

const ProductLanding = dynamic(() => import("@/components/features/ProductLanding"));
const DynamicIsland = dynamic(() => import("@/components/features/DynamicIsland"), { ssr: false });
const ShoppingAgentWidget = dynamic(() => import("@/components/features/ShoppingAgentWidget"), { ssr: false });
const ExitIntentModal = dynamic(() => import("@/components/features/ExitIntentModal"), { ssr: false });

export function DedicatedLandingShell({
  canonicalSlug,
  withWidgets,
}: {
  canonicalSlug: string;
  withWidgets: boolean;
}) {
  const Landing = LANDING_LOADERS[canonicalSlug];
  if (!Landing) return null;

  return (
    <>
      {withWidgets && <DynamicIsland slug={canonicalSlug} />}
      <Landing slug={canonicalSlug} />
      {withWidgets && <ShoppingAgentWidget slug={canonicalSlug} />}
      {withWidgets && <ExitIntentModal slug={canonicalSlug} />}
    </>
  );
}

export function GenericProductShell({
  slug,
  initialProduct,
  storeConfig,
  withWidgets,
}: {
  slug: string;
  initialProduct?: any;
  storeConfig?: any;
  withWidgets: boolean;
}) {
  return (
    <>
      {withWidgets && <DynamicIsland slug={slug} />}
      <ProductLanding
        slug={slug}
        initialProduct={initialProduct}
        storeConfig={storeConfig}
      />
      {withWidgets && <ShoppingAgentWidget slug={slug} />}
      {withWidgets && <ExitIntentModal slug={slug} />}
    </>
  );
}
