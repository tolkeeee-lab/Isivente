import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  Wallet,
  Activity,
  Smartphone,
  Globe,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import StoreMetaPixel from "@/components/tracking/StoreMetaPixel";

const FOUNDER_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";

export const metadata = {
  title: "Isivente | Créez votre boutique Paiement à la Livraison (COD) en Afrique",
  description:
    "La plateforme e-commerce pensée pour le Cash-on-Delivery au Bénin, Côte d'Ivoire, Togo, Sénégal et Cameroun. Pages ultra-rapides, formulaire anti-plaisantins, Pixel Meta isolé et suivi de caisse.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <StoreMetaPixel pixelId={FOUNDER_PIXEL_ID} />

      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-2xs">
              IS
            </span>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
              Isivente
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#fonctionnalites" className="hover:text-slate-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-slate-900 transition-colors">
              Tarifs
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <span>Essai gratuit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-[#F8FAFC] border-b border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
            <span>Bénin • Côte d&apos;Ivoire • Togo • Sénégal • Cameroun</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-[1.08]">
              Créez votre boutique{" "}
              <span className="text-emerald-600">Paiement à la Livraison</span> en 2 minutes
            </h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Zéro code, zéro lenteur sur 3G/4G. Publiez des pages produits qui convertissent,
              filtrez les plaisantins, connectez votre Pixel Meta et suivez au franc près ce qu&apos;il
              reste dans votre poche.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
            >
              <span>Créer ma boutique gratuitement (7 jours)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm sm:text-base shadow-2xs transition-colors"
            >
              <span>Accéder à mon espace</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Aucune carte bancaire requise
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Espace 100 % isolé par vendeur
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              WhatsApp &amp; Meta Pixel dédiés
            </span>
          </div>
        </div>
      </section>

      {/* ── 4 PILIERS FONCTIONNELS ── */}
      <section id="fonctionnalites" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Construit pour la réalité du terrain africain
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
            Tout ce qu&apos;il faut pour encaisser en Cash-on-Delivery
          </h2>
          <p className="text-sm text-slate-600">
            Fini les thèmes lourds conçus pour l&apos;Europe. Chaque outil d&apos;Isivente est calibré
            pour le mobile, les réseaux locaux et le paiement en espèces à la livraison.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Pages Produits Express sans coder
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Importez les photos depuis votre téléphone (compressées automatiquement pour charger
              en moins d&apos;une seconde sur MTN/Moov/Orange), ajoutez votre prix et vos bénéfices :
              votre lien de vente est prêt immédiatement.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Formulaire Anti-Plaisantins + WhatsApp 1-Clic
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Confirmation de disponibilité et du montant prêt avant validation, bouton de commande
              directe sur votre WhatsApp et capture des prospects pour ne perdre aucun visiteur payé.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Votre propre Pixel Meta 100 % Isolé
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Branchez votre Meta Pixel ID en 10 secondes dans vos réglages : vos événements
              PageView, ViewContent, InitiateCheckout et Purchase remontent proprement sur votre
              compte publicitaire sans aucun mélange.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <Wallet className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Suivi de Caisse &amp; Bénéfice Réel en Poche
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Indiquez votre capital de départ (ex : 100 000 FCFA), enregistrez vos achats stock,
              pubs et livreurs ainsi que vos ventes encaissées : sachez à tout instant combien il
              reste exactement dans votre poche.
            </p>
          </div>
        </div>
      </section>

      {/* ── TARIFS TRANSPARENTS ── */}
      <section id="tarifs" className="bg-[#F8FAFC] border-y border-slate-200/80 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Tarifs simples en FCFA
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-slate-950 tracking-tight">
              Démarrez gratuitement, payez quand vous vendez
            </h2>
            <p className="text-sm text-slate-600">
              0 % de commission sur vos ventes. Paiement par Mobile Money (MTN, Moov, Orange, Wave).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Essai */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Découverte
                </div>
                <div>
                  <span className="text-3xl font-black font-mono text-slate-950">0</span>
                  <span className="text-xs font-bold text-slate-500"> FCFA / 7 jours</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Création de votre boutique en 2 min
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Pages produits illimitées pendant l&apos;essai
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Formulaire COD + WhatsApp + Pixel Meta
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs text-center transition-colors"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Starter */}
            <div className="bg-white rounded-3xl border-2 border-emerald-500 p-6 flex flex-col justify-between space-y-6 shadow-lg shadow-emerald-500/10 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommandé
              </span>
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Plan Starter
                </div>
                <div>
                  <span className="text-3xl font-black font-mono text-slate-950">9 900</span>
                  <span className="text-xs font-bold text-slate-500"> FCFA / mois</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Jusqu&apos;à 10 pages produits COD actives
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Commandes illimitées • 0 % commission
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Suivi de caisse &amp; bénéfices nets inclus
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Upload photos compressées intégré
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition-colors shadow-sm"
              >
                Essayer 7 jours gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Plan Pro Scale
                </div>
                <div>
                  <span className="text-3xl font-black font-mono text-slate-950">19 900</span>
                  <span className="text-xs font-bold text-slate-500"> FCFA / mois</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Pages produits illimitées
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Relances paniers abandonnés WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Support prioritaire WhatsApp 7j/7
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors"
              >
                Choisir le Plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Isivente — Plateforme E-commerce COD Afrique</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-900">
            Connexion
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Inscription
          </Link>
          <a
            href="https://wa.me/2290192901817"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Support WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}
