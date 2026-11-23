import React from "react";
import { notFound } from "next/navigation";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";
import { getSupabase } from "@/lib/supabase";
import StoreMetaPixel from "@/components/tracking/StoreMetaPixel";
import {
  DedicatedLandingShell,
  GenericProductShell,
} from "@/components/features/DynamicLandingLoader";

const FOUNDER_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";

const SLUG_TO_CANONICAL: Record<string, string> = {
  cubicraft: "cubicraft",
  "cubi-craft": "cubicraft",
  pixelcraft: "cubicraft",
  "blocs-magnetiques": "cubicraft",
  mineblocks: "cubicraft",
  "savon-repousse": "savon-repousse",
  savon: "savon-repousse",
  "savon-usma": "savon-repousse",
  "savon-nature": "savon-repousse",
  biota: "savon-repousse",
  "voiture-camera": "voiture-camera",
  "voiture-telecommandee": "voiture-camera",
  "voiture-rc": "voiture-camera",
  c6: "voiture-camera",
  umei: "umei",
  brosse: "umei",
  "brosse-spray": "umei",
  yufan: "umei",
  peeler: "peeler",
  mandoline: "peeler",
  "coupe-legumes": "peeler",
  "masseur-oculaire": "masseur-oculaire",
  "eye-massager": "masseur-oculaire",
  microscope: "microscope",
  camera: "camera",
  trozk: "trozk",
  stabilisateur: "stabilisateur",
  stabilizer: "stabilisateur",
  eraclean: "eraclean",
  turbofan: "turbofan",
  veilleuse: "veilleuse",
  "mini-lave-linge": "mini-lave-linge",
  "lave-linge": "mini-lave-linge",
  washer: "mini-lave-linge",
  matelas: "matelas",
  "matelas-gonflable": "matelas",
  camping: "matelas",
  "sourire-eclatant": "sourire-eclatant",
  "routine-sourire": "sourire-eclatant",
  "dentifrice-violet": "sourire-eclatant",
  "projecteur-noel": "projecteur-noel",
  "lampe-noel": "projecteur-noel",
  noel: "projecteur-noel",
  "projecteur-usb": "projecteur-noel",
  "magie-noel": "projecteur-noel",
  "equilibre-feminin": "equilibre-feminin",
  "probiotiques-femme": "equilibre-feminin",
  "gummies-probiotiques": "equilibre-feminin",
  gummies: "equilibre-feminin",
  probiotiques: "equilibre-feminin",
  "bracelet-main": "bracelet-main",
  "bracelet-bague": "bracelet-main",
  "bracelet-eclat": "bracelet-main",
  "bijou-main": "bracelet-main",
  "stylo-3d": "stylo-3d",
  stylo: "stylo-3d",
  "stylo-3d-enfant": "stylo-3d",
  "3dpen": "stylo-3d",
  "stylo-3d-creatif": "stylo-3d",
  "carte-du-monde": "carte-du-monde",
  "carte-monde": "carte-du-monde",
  "scratch-map": "carte-du-monde",
  "carte-a-gratter": "carte-du-monde",
  "explore-the-world": "carte-du-monde",
  capsacare: "capsacare",
  "creme-douleur": "capsacare",
  "capsa-care": "capsacare",
  "creme-articulaire": "capsacare",
  odoraway: "odoraway",
  "odor-away": "odoraway",
  "creme-deodorante": "odoraway",
  "deodorant-aisselles": "odoraway",
  "duo-bracelets-coeur": "duo-bracelets-coeur",
  "bracelets-coeur": "duo-bracelets-coeur",
  "duo-coeur": "duo-bracelets-coeur",
  "bracelet-coeur": "duo-bracelets-coeur",
  "pare-soleil": "pare-soleil",
  "pare-brise": "pare-soleil",
  "anti-eblouissement": "pare-soleil",
  "visiere-auto": "pare-soleil",
  shilajit: "shilajit",
  "shilajit-gold": "shilajit",
  "shilajit-gummies": "shilajit",
  "pure-himalayan-shilajit": "shilajit",
  "himalayan-shilajit": "shilajit",
  "filtre-eau": "filtre-eau",
  "filtre-robinet": "filtre-eau",
  "filtre-eau-robinet": "filtre-eau",
  "purificateur-eau": "filtre-eau",
  "filtre-purificateur": "filtre-eau",
  "trousse-biometrique": "trousse-biometrique",
  "trousse-cuir": "trousse-biometrique",
  "pochette-biometrique": "trousse-biometrique",
  "organiseur-cuir": "trousse-biometrique",
  digestigum: "digestigum",
  "gummies-digestifs": "digestigum",
  "enzymes-digestives": "digestigum",
  "probio-digest": "digestigum",
  "calendrier-3d": "calendrier-3d",
  "calendrier-perpetuel": "calendrier-3d",
  "calendrier-decoratif": "calendrier-3d",
  "calendrier-magnetique": "calendrier-3d",
  "the-5-tresors": "the-5-tresors",
  "tisane-5-tresors": "the-5-tresors",
  "the-cinq-tresors": "the-5-tresors",
  "tisane-des-cinq-tresors": "the-5-tresors",
  "starlight-chargeur": "starlight-chargeur",
  "chargeur-retractable": "starlight-chargeur",
  starlight: "starlight-chargeur",
  "chargeur-5en1": "starlight-chargeur",
  "chargeur-voiture": "starlight-chargeur",
  "likel-rite": "likel-rite",
  diffuseur: "likel-rite",
  "diffuseur-arome": "likel-rite",
  humidificateur: "likel-rite",
  "parfum-interieur": "likel-rite",
  "game-stick-4k": "game-stick-4k",
  "game-stick": "game-stick-4k",
  gamestick: "game-stick-4k",
  "game-stick-pro": "game-stick-4k",
  "console-retro": "game-stick-4k",
  r36s: "r36s",
  "console-r36s": "r36s",
  "r36s-portable": "r36s",
  "moustiquaire-porte": "moustiquaire-porte",
  moustiquaire: "moustiquaire-porte",
  "moustiquaire-magnetique": "moustiquaire-porte",
  "moustiquaire-aimantee": "moustiquaire-porte",
  "masseur-vibrant": "masseur-vibrant",
  "masseur-abdomen-dos": "masseur-vibrant",
  "masseur-2en1": "masseur-vibrant",
};

const STANDALONE_LANDINGS = new Set([
  "masseur-vibrant",
  "likel-rite",
  "umei",
  "trousse-biometrique",
  "r36s",
]);

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CANONICAL).map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const product = DEFAULT_CATALOG_MAP[normalizedSlug];
  if (product) {
    const title = product.shortTitle || product.title;
    return {
      title: `${title} | Isivente`,
      description: `Commandez ${title} avec livraison rapide et paiement en espèces à la réception.`,
    };
  }

  try {
    const supabase = getSupabase();
    const { data: prod } = await supabase
      .from("products")
      .select("title, headline, store_id")
      .eq("slug", normalizedSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (prod?.title) {
      let brand = "Boutique Officielle";
      if (prod.store_id) {
        const { data: store } = await supabase
          .from("public_stores")
          .select("name")
          .eq("id", prod.store_id)
          .maybeSingle();
        if (store?.name) brand = store.name;
      }
      return {
        title: `${prod.title} | ${brand}`,
        description:
          prod.headline ||
          `Commandez ${prod.title} chez ${brand}. Livraison rapide et paiement à la réception.`,
      };
    }
  } catch {}

  return {
    title: "Boutique Officielle | Isivente",
    description: "Commandez avec livraison express et paiement en espèces à la réception.",
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();
  const canonicalSlug = SLUG_TO_CANONICAL[normalizedSlug];

  if (canonicalSlug) {
    return (
      <>
        <StoreMetaPixel pixelId={FOUNDER_PIXEL_ID} />
        <DedicatedLandingShell
          canonicalSlug={canonicalSlug}
          withWidgets={!STANDALONE_LANDINGS.has(canonicalSlug)}
        />
      </>
    );
  }

  // Si ce n'est pas une landing dédiée du fondateur, chercher dans Supabase ou DEFAULT_CATALOG (Multi-Boutiques unifié)
  let dbProduct: any = null;
  let storeConfig: any = null;

  try {
    const supabase = getSupabase();
    const { data: prod } = await supabase
      .from("products")
      .select("*")
      .eq("slug", normalizedSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (prod) {
      dbProduct = prod;
      if (prod.store_id) {
        const { data: store } = await supabase
          .from("public_stores")
          .select("id, name, slug, country, currency, city, whatsapp_number, meta_pixel_id, accent_color, is_active")
          .eq("id", prod.store_id)
          .maybeSingle();
        if (store) {
          storeConfig = store;
        } else {
          return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans text-slate-900">
              <div className="max-w-md w-full bg-white rounded-[14px] border border-black/[0.08] p-8 text-center space-y-3 shadow-xs">
                <h1 className="text-xl font-black text-slate-900">
                  Boutique temporairement en pause
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Cette page produit est momentanément indisponible. Revenez un peu plus tard.
                </p>
              </div>
            </div>
          );
        }
      }
    }
  } catch {}

  if (dbProduct) {
    const resolvedPixelId = storeConfig
      ? storeConfig.meta_pixel_id || null
      : FOUNDER_PIXEL_ID;

    return (
      <>
        <StoreMetaPixel pixelId={resolvedPixelId} />
        <GenericProductShell
          slug={normalizedSlug}
          initialProduct={dbProduct}
          storeConfig={storeConfig}
          withWidgets={false}
        />
      </>
    );
  }

  if (DEFAULT_CATALOG_MAP[normalizedSlug]) {
    return (
      <>
        <StoreMetaPixel pixelId={FOUNDER_PIXEL_ID} />
        <GenericProductShell slug={normalizedSlug} withWidgets={true} />
      </>
    );
  }

  return notFound();
}
