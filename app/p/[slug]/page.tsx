import ProductLanding from "@/components/features/ProductLanding";
import EraCleanLanding from "@/components/features/EraCleanLanding";
import TurboFanLanding from "@/components/features/TurboFanLanding";
import PeelerLanding from "@/components/features/PeelerLanding";
import StabilizerLanding from "@/components/features/StabilizerLanding";
import VeilleuseLanding from "@/components/features/VeilleuseLanding";
import UmeiLanding from "@/components/features/UmeiLanding";

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
