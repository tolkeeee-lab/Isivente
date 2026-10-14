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
import MiniLaveLingeLanding from "@/components/features/MiniLaveLingeLanding";
import MatelasLanding from "@/components/features/MatelasLanding";
import VoitureCameraLanding from "@/components/features/VoitureCameraLanding";
import SavonRepousseLanding from "@/components/features/SavonRepousseLanding";
import SourireEclatantLanding from "@/components/features/SourireEclatantLanding";
import ProjecteurNoelLanding from "@/components/features/ProjecteurNoelLanding";
import ProbioticGummiesLanding from "@/components/features/ProbioticGummiesLanding";
import BraceletMainLanding from "@/components/features/BraceletMainLanding";
import Stylo3DLanding from "@/components/features/Stylo3DLanding";
import CarteDuMondeLanding from "@/components/features/CarteDuMondeLanding";
import CapsaCareLanding from "@/components/features/CapsaCareLanding";
import OdorAwayLanding from "@/components/features/OdorAwayLanding";
import DuoBraceletsCoeurLanding from "@/components/features/DuoBraceletsCoeurLanding";
import ParesoleilLanding from "@/components/features/ParesoleilLanding";
import ShilajitLanding from "@/components/features/ShilajitLanding";
import FiltreEauLanding from "@/components/features/FiltreEauLanding";
import ProductLanding from "@/components/features/ProductLanding";
import ShoppingAgentWidget from "@/components/features/ShoppingAgentWidget";
import ExitIntentModal from "@/components/features/ExitIntentModal";
import DynamicIsland from "@/components/features/DynamicIsland";
import { DEFAULT_CATALOG_MAP } from "@/lib/defaultCatalog";

export function generateStaticParams() {
  return [
    { slug: "savon-repousse" },
    { slug: "savon" },
    { slug: "savon-usma" },
    { slug: "savon-nature" },
    { slug: "biota" },
    { slug: "voiture-camera" },
    { slug: "voiture-telecommandee" },
    { slug: "voiture-rc" },
    { slug: "c6" },
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
    { slug: "mini-lave-linge" },
    { slug: "lave-linge" },
    { slug: "mandoline" },
    { slug: "coupe-legumes" },
    { slug: "matelas" },
    { slug: "matelas-gonflable" },
    { slug: "camping" },
    { slug: "brosse" },
    { slug: "brosse-spray" },
    { slug: "yufan" },
    { slug: "sourire-eclatant" },
    { slug: "routine-sourire" },
    { slug: "dentifrice-violet" },
    { slug: "projecteur-noel" },
    { slug: "lampe-noel" },
    { slug: "noel" },
    { slug: "projecteur-usb" },
    { slug: "magie-noel" },
    { slug: "equilibre-feminin" },
    { slug: "probiotiques-femme" },
    { slug: "gummies-probiotiques" },
    { slug: "gummies" },
    { slug: "probiotiques" },
    { slug: "bracelet-main" },
    { slug: "bracelet-bague" },
    { slug: "bracelet-eclat" },
    { slug: "bijou-main" },
    { slug: "stylo-3d" },
    { slug: "stylo" },
    { slug: "stylo-3d-enfant" },
    { slug: "3dpen" },
    { slug: "stylo-3d-creatif" },
    { slug: "carte-du-monde" },
    { slug: "carte-monde" },
    { slug: "scratch-map" },
    { slug: "carte-a-gratter" },
    { slug: "explore-the-world" },
    { slug: "capsacare" },
    { slug: "creme-douleur" },
    { slug: "capsa-care" },
    { slug: "creme-articulaire" },
    { slug: "odoraway" },
    { slug: "odor-away" },
    { slug: "creme-deodorante" },
    { slug: "deodorant-aisselles" },
    { slug: "duo-bracelets-coeur" },
    { slug: "bracelets-coeur" },
    { slug: "duo-coeur" },
    { slug: "bracelet-coeur" },
    { slug: "pare-soleil" },
    { slug: "pare-brise" },
    { slug: "anti-eblouissement" },
    { slug: "visiere-auto" },
    { slug: "shilajit" },
    { slug: "shilajit-gold" },
    { slug: "shilajit-gummies" },
    { slug: "pure-himalayan-shilajit" },
    { slug: "himalayan-shilajit" },
    { slug: "filtre-eau" },
    { slug: "filtre-robinet" },
    { slug: "filtre-eau-robinet" },
    { slug: "purificateur-eau" },
    { slug: "filtre-purificateur" },
  ];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = DEFAULT_CATALOG_MAP[slug.toLowerCase()];
  const title = product?.shortTitle || product?.title || "Boutique Officielle";
  return {
    title: `${title} | Isivente Bénin`,
    description: `Commandez ${title} sur Isivente. Livraison express sous 24h au Bénin et paiement en espèces à la réception.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const normalizedSlug = slug.toLowerCase();

  const renderContent = () => {
    switch (normalizedSlug) {
      case "savon-repousse":
      case "savon":
      case "savon-usma":
      case "savon-nature":
      case "biota":
        return <SavonRepousseLanding slug="savon-repousse" />;
      case "voiture-camera":
      case "voiture-telecommandee":
      case "voiture-rc":
      case "c6":
        return <VoitureCameraLanding slug="voiture-camera" />;
      case "umei":
      case "brosse":
      case "brosse-spray":
      case "yufan":
        return <UmeiLanding slug="umei" />;
      case "peeler":
      case "mandoline":
      case "coupe-legumes":
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
      case "mini-lave-linge":
      case "lave-linge":
      case "washer":
        return <MiniLaveLingeLanding slug="mini-lave-linge" />;
      case "matelas":
      case "matelas-gonflable":
      case "camping":
        return <MatelasLanding slug="matelas" />;
      case "sourire-eclatant":
      case "routine-sourire":
      case "dentifrice-violet":
        return <SourireEclatantLanding slug="sourire-eclatant" />;
      case "projecteur-noel":
      case "lampe-noel":
      case "noel":
      case "projecteur-usb":
      case "magie-noel":
        return <ProjecteurNoelLanding slug="projecteur-noel" />;
      case "equilibre-feminin":
      case "probiotiques-femme":
      case "gummies-probiotiques":
      case "gummies":
      case "probiotiques":
        return <ProbioticGummiesLanding slug="equilibre-feminin" />;
      case "bracelet-main":
      case "bracelet-bague":
      case "bracelet-eclat":
      case "bijou-main":
        return <BraceletMainLanding slug="bracelet-main" />;
      case "stylo-3d":
      case "stylo":
      case "stylo-3d-enfant":
      case "3dpen":
      case "stylo-3d-creatif":
        return <Stylo3DLanding slug="stylo-3d" />;
      case "carte-du-monde":
      case "carte-monde":
      case "scratch-map":
      case "carte-a-gratter":
      case "explore-the-world":
        return <CarteDuMondeLanding slug="carte-du-monde" />;
      case "capsacare":
      case "creme-douleur":
      case "capsa-care":
      case "creme-articulaire":
        return <CapsaCareLanding slug="capsacare" />;
      case "odoraway":
      case "odor-away":
      case "creme-deodorante":
      case "deodorant-aisselles":
        return <OdorAwayLanding slug="odoraway" />;
      case "duo-bracelets-coeur":
      case "bracelets-coeur":
      case "duo-coeur":
      case "bracelet-coeur":
        return <DuoBraceletsCoeurLanding slug="duo-bracelets-coeur" />;
      case "pare-soleil":
      case "pare-brise":
      case "anti-eblouissement":
      case "visiere-auto":
        return <ParesoleilLanding slug="pare-soleil" />;
      case "shilajit":
      case "shilajit-gold":
      case "shilajit-gummies":
      case "pure-himalayan-shilajit":
      case "himalayan-shilajit":
        return <ShilajitLanding slug="shilajit" />;
      case "filtre-eau":
      case "filtre-robinet":
      case "filtre-eau-robinet":
      case "purificateur-eau":
      case "filtre-purificateur":
        return <FiltreEauLanding slug="filtre-eau" />;
      default:
        // If the slug exists in our catalog or database, render universal ProductLanding
        if (DEFAULT_CATALOG_MAP[normalizedSlug]) {
          return <ProductLanding slug={normalizedSlug} />;
        }
        return notFound();
    }
  };

  return (
    <>
      <DynamicIsland slug={normalizedSlug} />
      {renderContent()}
      <ShoppingAgentWidget slug={normalizedSlug} />
      <ExitIntentModal slug={normalizedSlug} />
    </>
  );
}

