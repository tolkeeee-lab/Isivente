import React from "react";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import StoreMetaPixel from "@/components/tracking/StoreMetaPixel";
import SaasThemePreview from "@/components/features/SaasThemePreview";

const FOUNDER_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";

export const metadata = {
  title: "Isivente | Boutique Paiement à la Livraison (COD) pour l'Afrique francophone",
  description:
    "Créez votre boutique Cash-on-Delivery au Bénin, Côte d'Ivoire, Togo, Sénégal et Cameroun. Pages rapides sur 3G/4G, filtre anti-plaisantins, Pixel Meta isolé et suivi de caisse.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#1f1b16] font-sans antialiased">
      <StoreMetaPixel pixelId={FOUNDER_PIXEL_ID} />

      {/* Navigation silencieuse */}
      <header className="sticky top-0 z-40 bg-[#f7f4ee]/95 backdrop-blur-sm border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-[6px] bg-[#1f1b16] text-[#fdfbf7] flex items-center justify-center font-medium text-[12px]">
              IS
            </span>
            <span className="font-medium text-[16px] text-[#1f1b16] leading-none">
              Isivente
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[14px] font-normal text-[#5e554a]">
            <a href="#fonctionnalites" className="hover:text-[#1f1b16] transition-colors duration-150">
              Outils COD
            </a>
            <a href="#comparatif" className="hover:text-[#1f1b16] transition-colors duration-150">
              Comparatif
            </a>
            <a href="#tarifs" className="hover:text-[#1f1b16] transition-colors duration-150">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-[#1f1b16] transition-colors duration-150">
              Questions
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-[14px] font-normal text-[#5e554a] hover:text-[#1f1b16] transition-colors duration-150"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="h-9 px-4 rounded-[8px] bg-[#1f1b16] hover:bg-[#332c24] text-[#fdfbf7] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors duration-150"
            >
              <span>Essai gratuit</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero en split asymétrique : texte calme à gauche, vrai aperçu COD interactif à droite */}
      <section className="border-b border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[13px] font-normal text-[#7b7266]">
              Bénin · Côte d&apos;Ivoire · Togo · Sénégal · Cameroun
            </p>

            <h1 className="text-[38px] sm:text-[52px] lg:text-[58px] leading-[1.05] font-medium text-[#1f1b16] tracking-[-0.03em]">
              Vendez en paiement à la livraison sans perdre vos commandes
            </h1>

            <p className="text-[17px] sm:text-[19px] leading-[1.5] font-normal text-[#5e554a] max-w-[34rem]">
              Publiez vos pages produits depuis votre téléphone, filtrez les faux numéros avant l&apos;envoi du livreur et suivez votre caisse réelle en FCFA.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/register"
                className="h-12 px-6 rounded-[10px] bg-[#1f1b16] hover:bg-[#332c24] text-[#fdfbf7] text-[15px] font-medium inline-flex items-center gap-2 transition-colors duration-150"
              >
                <span>Créer ma boutique</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </Link>
              <a
                href="#tarifs"
                className="h-12 px-5 rounded-[10px] bg-[#efe9df] hover:bg-[#e5ddd0] border border-black/[0.08] text-[#1f1b16] text-[15px] font-medium inline-flex items-center transition-colors duration-150"
              >
                Voir les tarifs
              </a>
            </div>

            <div className="pt-6 border-t border-black/[0.08] grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-[22px] font-medium font-mono tabular-nums text-[#1f1b16]">
                  0%
                </div>
                <div className="text-[13px] text-[#7b7266] mt-0.5">
                  Commission sur ventes
                </div>
              </div>
              <div>
                <div className="text-[22px] font-medium font-mono tabular-nums text-[#1f1b16]">
                  &lt; 100 Ko
                </div>
                <div className="text-[13px] text-[#7b7266] mt-0.5">
                  Photos compressées 3G
                </div>
              </div>
              <div>
                <div className="text-[22px] font-medium font-mono tabular-nums text-[#15803d]">
                  7 jours
                </div>
                <div className="text-[13px] text-[#7b7266] mt-0.5">
                  Essai sans carte Visa
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <SaasThemePreview />
          </div>
        </div>
      </section>

      {/* Outils terrain COD */}
      <section id="fonctionnalites" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 space-y-12">
        <div className="max-w-2xl space-y-2">
          <p className="text-[13px] text-[#7b7266]">Conçu pour le terrain COD</p>
          <h2 className="text-[28px] sm:text-[36px] leading-[1.15] font-medium text-[#1f1b16] tracking-[-0.02em]">
            Quatre outils qui protègent votre marge entre le clic publicitaire et l&apos;encaissement
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-3">
            <div className="text-[12px] font-mono text-[#7b7266]">01 · Pages mobiles</div>
            <h3 className="text-[18px] font-medium text-[#1f1b16]">
              Publication en 2 minutes depuis la galerie photo
            </h3>
            <p className="text-[14px] leading-relaxed text-[#5e554a]">
              Ajoutez vos photos directement depuis votre téléphone. Isivente les compresse automatiquement sous 100 Ko pour un affichage immédiat sur les réseaux MTN, Moov et Orange.
            </p>
          </div>

          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-3">
            <div className="text-[12px] font-mono text-[#7b7266]">02 · Anti-retours</div>
            <h3 className="text-[18px] font-medium text-[#1f1b16]">
              Confirmation d&apos;engagement et commande WhatsApp
            </h3>
            <p className="text-[14px] leading-relaxed text-[#5e554a]">
              Chaque client coche sa disponibilité et le montant prêt avant de valider. S&apos;il hésite, un bouton WhatsApp pré-rempli vous permet de conclure la vente en direct.
            </p>
          </div>

          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-3">
            <div className="text-[12px] font-mono text-[#7b7266]">03 · Publicité</div>
            <h3 className="text-[18px] font-medium text-[#1f1b16]">
              Pixel Meta et données isolés par boutique
            </h3>
            <p className="text-[14px] leading-relaxed text-[#5e554a]">
              Renseignez votre identifiant Pixel Meta dans vos réglages. Vos événements de visite et de commande remontent uniquement vers votre compte publicitaire, sans mélange avec d&apos;autres vendeurs.
            </p>
          </div>

          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-4">
            <div className="space-y-3">
              <div className="text-[12px] font-mono text-[#7b7266]">04 · Trésorerie</div>
              <h3 className="text-[18px] font-medium text-[#1f1b16]">
                Calcul exact de votre argent réel en poche
              </h3>
              <p className="text-[14px] leading-relaxed text-[#5e554a]">
                Saisissez votre capital de départ, vos achats de stock, budgets pub et frais livreurs pour connaître à tout moment votre bénéfice net réel.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.08] text-[12px]">
              <div>
                <div className="text-[#7b7266]">Capital</div>
                <div className="font-mono tabular-nums font-medium text-[#1f1b16] mt-0.5">100 000 F</div>
              </div>
              <div>
                <div className="text-[#7b7266]">Dépenses</div>
                <div className="font-mono tabular-nums font-medium text-[#5e554a] mt-0.5">-35 000 F</div>
              </div>
              <div>
                <div className="text-[#7b7266]">En poche</div>
                <div className="font-mono tabular-nums font-medium text-[#15803d] mt-0.5">145 000 F</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparatif factuel */}
      <section id="comparatif" className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] overflow-hidden">
          <div className="px-6 py-5 border-b border-black/[0.08]">
            <h2 className="text-[20px] font-medium text-[#1f1b16]">
              Isivente face aux plateformes classiques
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-black/[0.08] bg-[#f7f4ee]/60 text-[12px] text-[#7b7266]">
                  <th className="py-3 px-6 font-normal">Critère</th>
                  <th className="py-3 px-6 font-medium text-[#1f1b16]">Isivente</th>
                  <th className="py-3 px-6 font-normal">Shopify et équivalents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                <tr>
                  <td className="py-3.5 px-6 text-[#1f1b16]">Thème COD prêt à vendre</td>
                  <td className="py-3.5 px-6 font-medium text-[#15803d]">Inclus gratuitement</td>
                  <td className="py-3.5 px-6 text-[#7b7266]">100 à 250 $ à acheter</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 text-[#1f1b16]">Chargement mobile 3G/4G</td>
                  <td className="py-3.5 px-6 font-medium text-[#1f1b16]">Images compressées sous 100 Ko</td>
                  <td className="py-3.5 px-6 text-[#7b7266]">Thèmes lourds et lents</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 text-[#1f1b16]">Filtre anti-plaisantins et WhatsApp</td>
                  <td className="py-3.5 px-6 font-medium text-[#1f1b16]">Intégré d&apos;origine</td>
                  <td className="py-3.5 px-6 text-[#7b7266]">Applications payantes à empiler</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 text-[#1f1b16]">Suivi caisse et bénéfice net</td>
                  <td className="py-3.5 px-6 font-medium text-[#1f1b16]">Inclus dans l&apos;espace vendeur</td>
                  <td className="py-3.5 px-6 text-[#7b7266]">Tableur externe manuel</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 text-[#1f1b16]">Règlement de l&apos;abonnement</td>
                  <td className="py-3.5 px-6 font-medium text-[#15803d]">Mobile Money en FCFA</td>
                  <td className="py-3.5 px-6 text-[#7b7266]">Carte Visa internationale exigée</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="border-y border-black/[0.08] bg-[#fdfbf7] py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="max-w-xl space-y-2">
            <p className="text-[13px] text-[#7b7266]">Tarifs en FCFA</p>
            <h2 className="text-[28px] sm:text-[36px] leading-[1.15] font-medium text-[#1f1b16] tracking-[-0.02em]">
              Commencez gratuitement pendant 7 jours
            </h2>
            <p className="text-[14px] text-[#5e554a]">
              Aucune commission sur vos ventes. Règlement mensuel par MTN, Moov, Orange Money ou Wave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Essai */}
            <div className="bg-[#f7f4ee]/60 rounded-[14px] border border-black/[0.08] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-[14px] font-medium text-[#1f1b16]">Découverte</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] leading-none font-medium font-mono tabular-nums text-[#1f1b16]">
                    0 F
                  </span>
                  <span className="text-[13px] text-[#7b7266]">/ 7 jours</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#5e554a] pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Boutique configurée en 2 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Pages produits illimitées durant l&apos;essai</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Formulaire COD, WhatsApp et Pixel Meta</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="h-10 rounded-[8px] bg-white hover:bg-[#efe9df] border border-black/[0.08] text-[#1f1b16] font-medium text-[13px] inline-flex items-center justify-center transition-colors duration-150"
              >
                Démarrer l&apos;essai
              </Link>
            </div>

            {/* Starter (recommandé par bordure et accent sobre) */}
            <div className="bg-white rounded-[14px] border-2 border-[#1f1b16] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#1f1b16]">Starter</span>
                  <span className="text-[12px] font-medium text-[#15803d]">Recommandé</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] leading-none font-medium font-mono tabular-nums text-[#1f1b16]">
                    9 900 F
                  </span>
                  <span className="text-[13px] text-[#7b7266]">/ mois</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#5e554a] pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Jusqu&apos;à 10 pages produits actives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Commandes illimitées, 0% de commission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Suivi de caisse réelle et bénéfice net</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Compression photo mobile intégrée</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="h-10 rounded-[8px] bg-[#1f1b16] hover:bg-[#332c24] text-[#fdfbf7] font-medium text-[13px] inline-flex items-center justify-center transition-colors duration-150"
              >
                Essayer 7 jours gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#f7f4ee]/60 rounded-[14px] border border-black/[0.08] p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-[14px] font-medium text-[#1f1b16]">Pro Scale</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] leading-none font-medium font-mono tabular-nums text-[#1f1b16]">
                    19 900 F
                  </span>
                  <span className="text-[13px] text-[#7b7266]">/ mois</span>
                </div>
                <ul className="space-y-2.5 text-[13px] text-[#5e554a] pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Pages produits illimitées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Relances paniers abandonnés WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 stroke-[1.5] text-[#15803d] shrink-0 mt-0.5" />
                    <span>Support prioritaire WhatsApp 7j/7</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="h-10 rounded-[8px] bg-white hover:bg-[#efe9df] border border-black/[0.08] text-[#1f1b16] font-medium text-[13px] inline-flex items-center justify-center transition-colors duration-150"
              >
                Choisir le plan Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Questions fréquentes */}
      <section id="faq" className="max-w-5xl mx-auto px-5 sm:px-8 py-20 space-y-10">
        <h2 className="text-[24px] sm:text-[28px] font-medium text-[#1f1b16] tracking-[-0.02em]">
          Questions fréquentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-2">
            <h3 className="text-[15px] font-medium text-[#1f1b16]">
              Faut-il une carte bancaire pour démarrer ?
            </h3>
            <p className="text-[14px] text-[#5e554a] leading-relaxed">
              Non. Vous créez votre compte avec votre adresse e-mail et testez gratuitement pendant 7 jours. L&apos;abonnement se règle ensuite par Mobile Money.
            </p>
          </div>
          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-2">
            <h3 className="text-[15px] font-medium text-[#1f1b16]">
              Mes données et mon Pixel Meta restent-ils privés ?
            </h3>
            <p className="text-[14px] text-[#5e554a] leading-relaxed">
              Oui. Chaque boutique dispose de son propre identifiant isolé : commandes, prospects, trésorerie et Pixel Meta appartiennent exclusivement à votre compte.
            </p>
          </div>
          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-2">
            <h3 className="text-[15px] font-medium text-[#1f1b16]">
              Dois-je payer un thème supplémentaire ?
            </h3>
            <p className="text-[14px] text-[#5e554a] leading-relaxed">
              Non. Le thème COD est inclus et s&apos;adapte automatiquement à la couleur de votre marque et à votre devise.
            </p>
          </div>
          <div className="bg-[#fdfbf7] rounded-[14px] border border-black/[0.08] p-6 space-y-2">
            <h3 className="text-[15px] font-medium text-[#1f1b16]">
              Peut-on tout gérer depuis un smartphone ?
            </h3>
            <p className="text-[14px] text-[#5e554a] leading-relaxed">
              Oui. Création de pages produits, import de photos depuis votre galerie, validation des commandes et suivi de caisse fonctionnent directement sur mobile.
            </p>
          </div>
        </div>
      </section>

      {/* Footer sobre */}
      <footer className="border-t border-black/[0.08]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#7b7266]">
          <div className="text-[#1f1b16] font-medium">
            Isivente · E-commerce Paiement à la Livraison
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#1f1b16] transition-colors duration-150">
              Connexion
            </Link>
            <Link href="/register" className="hover:text-[#1f1b16] transition-colors duration-150">
              Créer un compte
            </Link>
            <a
              href="https://wa.me/2290192901817"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#15803d] font-medium hover:underline"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.5]" />
              <span>Support WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
