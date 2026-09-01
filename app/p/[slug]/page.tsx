import ProductLanding from "@/components/features/ProductLanding";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductLanding slug={slug} />;
}

