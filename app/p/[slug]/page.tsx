import ProductLanding from "@/components/features/ProductLanding";
import EraCleanLanding from "@/components/features/EraCleanLanding";
import TurboFanLanding from "@/components/features/TurboFanLanding";
import PeelerLanding from "@/components/features/PeelerLanding";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "eraclean") {
    return <EraCleanLanding slug={slug} />;
  }

  if (slug === "turbofan" || slug === "ventilateur" || slug === "fan") {
    return <TurboFanLanding slug="turbofan" />;
  }

  if (slug === "peeler" || slug === "eplucheur" || slug === "ail" || slug === "chefpeel") {
    return <PeelerLanding slug="peeler" />;
  }

  return <ProductLanding slug={slug} />;
}
