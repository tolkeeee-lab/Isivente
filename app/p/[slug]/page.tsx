import ProductLanding from "@/components/features/ProductLanding";
import EraCleanLanding from "@/components/features/EraCleanLanding";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "eraclean") {
    return <EraCleanLanding slug={slug} />;
  }

  return <ProductLanding slug={slug} />;
}

