import React from "react";
import { notFound } from "next/navigation";
import UmeiLanding from "@/components/features/UmeiLanding";
import PeelerLanding from "@/components/features/PeelerLanding";
import EyeMassagerLanding from "@/components/features/EyeMassagerLanding";
import MicroscopeLanding from "@/components/features/MicroscopeLanding";
import CameraLanding from "@/components/features/CameraLanding";
import TrozkLanding from "@/components/features/TrozkLanding";
import StabilisateurLanding from "@/components/features/StabilisateurLanding";
import EraCleanLanding from "@/components/features/EraCleanLanding";
import TurboFanLanding from "@/components/features/TurboFanLanding";
import VeilleuseLanding from "@/components/features/VeilleuseLanding";
import ProductLanding from "@/components/features/ProductLanding";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";

export function generateStaticParams() {
  return [
    { slug: "microscope" },
    { slug: "camera" },
    { slug: "masseur-oculaire" },
    { slug: "eye-massager" },
    { slug: "umei" },
    { slug: "peeler" },
    { slug: "trozk" },
    { slug: "stabilisateur" },
    { slug: "stabilizer" },
    { slug: "eraclean" },
    { slug: "turbofan" },
    { slug: "veilleuse" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();

  switch (normalizedSlug) {
    case "umei":
      return <UmeiLanding slug="umei" />;
    case "peeler":
      return <PeelerLanding slug="peeler" />;
    case "masseur-oculaire":
    case "eye-massager":
      return <EyeMassagerLanding slug="masseur-oculaire" />;
    case "microscope":
      return <MicroscopeLanding slug="microscope" />;
    case "camera":
      return <CameraLanding slug="camera" />;
    case "trozk":
      return <TrozkLanding slug="trozk" />;
    case "stabilisateur":
    case "stabilizer":
      return <StabilisateurLanding slug="stabilisateur" />;
    case "eraclean":
      return <EraCleanLanding slug="eraclean" />;
    case "turbofan":
      return <TurboFanLanding slug="turbofan" />;
    case "veilleuse":
      return <VeilleuseLanding slug="veilleuse" />;
    default:
      // If the slug exists in our catalog or database, render universal ProductLanding
      if (DEFAULT_CATALOG_MAP[normalizedSlug]) {
        return <ProductLanding slug={normalizedSlug} />;
      }
      return notFound();
  }
}

