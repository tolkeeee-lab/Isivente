"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, MessageCircle, Phone, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuccessPage() {
  const params = useParams();
  const slug = params.slug || "umei-pro";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-purple-100 p-6 sm:p-10 text-center shadow-xl">
        
        {/* ICON CHECK */}
        <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Commande Enregistrée avec Succès
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-purple-950 mt-3 mb-3 leading-tight">
          Félicitations !
        </h1>
        
        <p className="text-sm sm:text-base text-gray-600 font-normal mb-8 leading-relaxed">
          Merci pour votre confiance. Votre commande a bien été reçue. 
          Notre équipe va vous appeler sous peu pour valider l'heure de livraison avec notre coursier.
        </p>

        {/* ÉTAPES CLAIRES */}
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 sm:p-6 mb-6 text-left space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 mb-2">
            Que se passe-t-il maintenant ?
          </h3>
          
          <div className="flex gap-3 text-sm text-gray-800">
            <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-bold">Appel de confirmation</p>
              <p className="text-xs text-gray-500">Un membre de l'équipe vous contacte pour confirmer votre adresse exacte.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm text-gray-800">
            <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-bold">Expédition express (24h - 48h)</p>
              <p className="text-xs text-gray-500">Notre livreur prend en charge votre colis.</p>
            </div>
          </div>

          <div className="flex gap-3 text-sm text-gray-800">
            <span className="w-6 h-6 rounded-full bg-purple-200 text-purple-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-bold">Vérification & Paiement à la réception</p>
              <p className="text-xs text-gray-500">Vous ouvrez le paquet, vérifiez le produit et réglez en espèces au livreur.</p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <a 
            href={`https://wa.me/22997000000?text=${encodeURIComponent("Bonjour ! Je viens de passer ma commande sur le site et je souhaite confirmer la livraison.")}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Accélérer ma livraison via WhatsApp</span>
          </a>

          <Link href={`/p/${slug}`} className="block">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
              <span>Retourner à la page produit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Colis Garanti</span>
          <span className="flex items-center gap-1"><PackageCheck className="w-3.5 h-3.5 text-purple-600" /> Paiement Sécurisé</span>
        </div>

      </div>
    </div>
  );
}
