import React from "react";
import { notFound } from "next/navigation";
import UmeiLanding from "@/components/features/UmeiLanding";
import PeelerLanding from "@/components/features/PeelerLanding";
import EyeMassagerLanding from "@/components/features/EyeMassagerLanding";
import MicroscopeLanding from "@/components/features/MicroscopeLanding";
import CameraLanding from "@/components/features/CameraLanding";
import TrozkLanding from "@/components/features/TrozkLanding";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  switch (slug.toLowerCase()) {
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
    default:
      return notFound();
  }
}
