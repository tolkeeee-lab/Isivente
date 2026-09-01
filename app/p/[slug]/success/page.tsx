"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SuccessPage() {
  const params = useParams();
  const slug = params.slug;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-panel flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white max-w-lg w-full rounded-[32px] border-2 border-ink p-8 md:p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-mint-deep border-2 border-ink rounded-full flex items-center justify-center mx-auto mb-8 shadow-sticker">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="font-display text-[32px] font-bold text-ink mb-4 leading-tight">
          Commande confirmée !
        </h1>
        
        <p className="text-[16px] text-ink-soft font-medium mb-8 leading-relaxed">
          Merci pour votre confiance. Votre commande a bien été enregistrée. 
          Notre équipe vous contactera très rapidement par WhatsApp ou appel pour confirmer l'heure de livraison.
        </p>

        <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-500 mb-3">Prochaines étapes</h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-[15px] font-bold text-ink">
              <span className="text-magenta shrink-0">1.</span> 
              Confirmation de l'adresse par appel
            </li>
            <li className="flex gap-3 text-[15px] font-bold text-ink">
              <span className="text-magenta shrink-0">2.</span> 
              Expédition via notre coursier (24-48h)
            </li>
            <li className="flex gap-3 text-[15px] font-bold text-ink">
              <span className="text-magenta shrink-0">3.</span> 
              Paiement en espèces à la réception
            </li>
          </ul>
        </div>

        <Link href={`/p/${slug}`}>
          <Button variant="takeboost" size="lg" className="w-full text-[16px]">
            Retour à la boutique <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

