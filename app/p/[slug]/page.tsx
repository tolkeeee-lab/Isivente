import { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import ProductLanding from "@/components/features/ProductLanding";
import EraCleanLanding from "@/components/features/EraCleanLanding";
import TurboFanLanding from "@/components/features/TurboFanLanding";
import PeelerLanding from "@/components/features/PeelerLanding";
import StabilizerLanding from "@/components/features/StabilizerLanding";
import VeilleuseLanding from "@/components/features/VeilleuseLanding";
import UmeiLanding from "@/components/features/UmeiLanding";

/* ─── Données OG statiques pour les pages custom ─── */
const CUSTOM_META: Record<string, { title: string; description: string; image: string; price: number }> = {
  umei: {
    title: "Brosse Démêlante Vapeur Uméi 3-en-1",
    description: "Démêle tes boucles sans douleur. Vapeur + huile + clic libérateur. Livraison 24h au Bénin, paiement à la réception.",
    image: "/images/umei-hero-real.jpg",
    price: 14900,
  },
  eraclean: {
    title: "Purificateur d'Air & Anti-Odeurs EraClean™",
    description: "Élimine 99% des odeurs de frigo, WC et voiture. Autonomie 10 ans, rechargement solaire. Livraison 24h.",
    image: "/images/eraclean-studio.jpg",
    price: 19900,
  },
  turbofan: {
    title: "Ventilateur Ceinture & Powerbank TurboFan™ Max",
    description: "Mini ventilateur portable avec batterie 8000mAh intégrée. Fraîcheur garantie toute la journée. Livraison 24h.",
    image: "/images/turbofan-studio.jpg",
    price: 16900,
  },
  peeler: {
    title: "Éplucheur Automatique ChefPeel™ Pro",
    description: "Épluche pommes, pommes de terre et fruits en 8 secondes. Idéal cuisine familiale et pro. Livraison 24h.",
    image: "/images/peeler-hero.jpg",
    price: 14900,
  },
  stabilisateur: {
    title: "Stabilisateur Pro-Mobile Z3 Zoom™",
    description: "Trépied stabilisateur avec commande Bluetooth et suivi automatique du visage. Livraison 24h au Bénin.",
    image: "/images/stabilisateur-hero.jpg",
    price: 49900,
  },
  veilleuse: {
    title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
    description: "24 disques de projection galaxie, océan, étoiles. Col flexible USB. Idéal chambre enfant. Livraison 24h.",
    image: "/images/projecteur-hero.jpg",
    price: 14900,
  },
};

/* Slug aliases → canonical slug */
const SLUG_ALIASES: Record<string, string> = {
  ventilateur: "turbofan",
  fan: "turbofan",
  eplucheur: "peeler",
  ail: "peeler",
  chefpeel: "peeler",
  trepied: "stabilisateur",
  gimbal: "stabilisateur",
  z3: "stabilisateur",
  projecteur: "veilleuse",
  galaxie: "veilleuse",
  friosz: "veilleuse",
  "veilleuse-3d": "veilleuse",
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uelognqedzqtvupwzejh.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbG9nbnFlZHpxdHZ1cHd6ZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTE0ODgsImV4cCI6MjEwMzc4NzQ4OH0.DjUgqgALNjMIIolen-L6blr4kxUgPi3TKUBeX-TnK9k";
  return createServerClient(url, key, {
    cookies: { get() { return undefined; }, set() {}, remove() {} },
  });
}

const BASE_URL = "https://isivente.vercel.app";
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

/* ─── generateMetadata : OG dynamique pour WhatsApp / Facebook / Meta Ads ─── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonical = SLUG_ALIASES[slug] || slug;

  // 1. Chercher dans les pages custom
  const custom = CUSTOM_META[canonical];
  if (custom) {
    return {
      title: `${custom.title} — ${fmt(custom.price)} FCFA | Isivente`,
      description: custom.description,
      openGraph: {
        title: `${custom.title} — ${fmt(custom.price)} FCFA`,
        description: custom.description,
        url: `${BASE_URL}/p/${canonical}`,
        siteName: "Isivente",
        images: [{ url: `${BASE_URL}${custom.image}`, width: 1200, height: 630, alt: custom.title }],
        locale: "fr_FR",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${custom.title} — ${fmt(custom.price)} FCFA`,
        description: custom.description,
        images: [`${BASE_URL}${custom.image}`],
      },
    };
  }

  // 2. Fallback : chercher dans Supabase
  try {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("products")
      .select("title, price, image_url, slug")
      .eq("slug", slug)
      .single();

    if (data) {
      const imageUrl = data.image_url?.startsWith("http")
        ? data.image_url
        : `${BASE_URL}${data.image_url || "/images/default-hero.jpg"}`;
      
      return {
        title: `${data.title} — ${fmt(data.price)} FCFA | Isivente`,
        description: `${data.title}. Livraison express 24h au Bénin, paiement à la réception.`,
        openGraph: {
          title: `${data.title} — ${fmt(data.price)} FCFA`,
          description: `${data.title}. Livraison express 24h, paiement à la réception.`,
          url: `${BASE_URL}/p/${slug}`,
          siteName: "Isivente",
          images: [{ url: imageUrl, width: 1200, height: 630, alt: data.title }],
          locale: "fr_FR",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: `${data.title} — ${fmt(data.price)} FCFA`,
          description: `Livraison express 24h, paiement à la réception.`,
          images: [imageUrl],
        },
      };
    }
  } catch {}

  // 3. Fallback générique
  return {
    title: "Isivente — Produits Premium, Livraison 24h au Bénin",
    description: "Découvrez nos produits sélectionnés avec soin. Livraison express et paiement à la réception.",
  };
}

/* ─── Page Component ─── */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ── Pages custom existantes (inchangées) ──
  if (slug === "umei") {
    return <UmeiLanding slug={slug} />;
  }

  if (slug === "eraclean") {
    return <EraCleanLanding slug={slug} />;
  }

  if (slug === "turbofan" || slug === "ventilateur" || slug === "fan") {
    return <TurboFanLanding slug="turbofan" />;
  }

  if (slug === "peeler" || slug === "eplucheur" || slug === "ail" || slug === "chefpeel") {
    return <PeelerLanding slug="peeler" />;
  }

  if (slug === "stabilisateur" || slug === "trepied" || slug === "gimbal" || slug === "z3") {
    return <StabilizerLanding slug="stabilisateur" />;
  }

  if (slug === "veilleuse" || slug === "projecteur" || slug === "galaxie" || slug === "friosz" || slug === "veilleuse-3d") {
    return <VeilleuseLanding slug="veilleuse" />;
  }

  // ── Fallback générique : charge depuis Supabase ──
  return <ProductLanding slug={slug} />;
}
