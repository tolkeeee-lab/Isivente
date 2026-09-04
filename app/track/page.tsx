"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  RotateCw
} from "lucide-react";

interface OrderTrackingData {
  id?: string;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  shipping_city?: string;
  city?: string;
  shipping_address?: string;
  address?: string;
  product_title?: string;
  product_slug?: string;
  quantity?: number;
  total_amount: number;
  status: string;
  created_at?: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("phone") || searchParams.get("order") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<OrderTrackingData[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (searchTerm?: string) => {
    const term = (searchTerm ?? query).trim();
    if (!term) {
      setErrorMsg("Veuillez saisir votre numéro de téléphone ou votre référence de commande.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setSearched(true);

    try {
      // 1. Recherche dans Supabase par téléphone ou order_number
      // Nettoyage des chiffres du téléphone
      const cleanPhone = term.replace(/\D/g, "");

      let queryBuilder = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (cleanPhone.length >= 6) {
        queryBuilder = queryBuilder.or(`customer_phone.ilike.%${cleanPhone}%,order_number.ilike.%${term}%`);
      } else {
        queryBuilder = queryBuilder.ilike("order_number", `%${term}%`);
      }

      const { data, error } = await queryBuilder.limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        setOrders(data);
      } else {
        // Fallback local storage
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("isivente_orders_store");
          if (cached) {
            try {
              const localList = JSON.parse(cached);
              const matched = localList.filter((o: any) => 
                (o.customer_phone && o.customer_phone.includes(term)) ||
                (o.order_number && o.order_number.toLowerCase().includes(term.toLowerCase()))
              );
              setOrders(matched);
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setErrorMsg("Impossible de récupérer la commande pour l'instant. Réessayez ou contactez le support.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, []);

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 1; // Validée
      case "confirmed":
      case "processing":
        return 2; // En préparation
      case "shipped":
        return 3; // En cours de livraison
      case "delivered":
        return 4; // Livrée
      case "cancelled":
        return 0;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          label: "Colis Livré & Encaissé",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "shipped":
        return {
          label: "En cours d'acheminement express",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: Truck,
        };
      case "confirmed":
        return {
          label: "Commande Confirmée — Préparation",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Package,
        };
      case "cancelled":
        return {
          label: "Commande Annulée",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: AlertCircle,
        };
      case "pending":
      default:
        return {
          label: "Commande Enregistrée — En attente d'appel",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-100 font-sans">
      
      {/* NAVBAR */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Accueil Isivente</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Suivi Express 24h</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        
        {/* TITRE ET RECHERCHE */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-semibold text-indigo-700">
            <Package className="w-3.5 h-3.5" />
            <span>Espace Client Isivente</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Suivre l'état de ma commande
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Entrez votre numéro de téléphone ou la référence de votre commande pour connaître sa position en temps réel.
          </p>
        </div>

        {/* INPUT DE RECHERCHE FIGMA-GRADE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-2.5 max-w-xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 97000000 ou ISI-1234"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin text-slate-300" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Rechercher</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="max-w-xl mx-auto p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* RÉSULTATS DE SUIVI */}
        {searched && !loading && orders.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="font-display font-bold text-base text-slate-900">Aucune commande trouvée</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Vérifiez le numéro de téléphone utilisé lors de votre commande ou contactez notre service client pour vous aider.
            </p>
            <a
              href={`https://wa.me/2290192901817?text=${encodeURIComponent(`Bonjour, je recherche ma commande avec la référence ou numéro : ${query}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contacter le support WhatsApp</span>
            </a>
          </div>
        )}

        {/* CARTES DE COMMANDES */}
        {orders.length > 0 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {orders.map((order, idx) => {
              const currentStep = getStepIndex(order.status);
              const badge = getStatusBadge(order.status);
              const BadgeIcon = badge.icon;
              const formattedPrice = new Intl.NumberFormat("fr-FR").format(order.total_amount || 0);

              const steps = [
                { id: 1, title: "Reçue", desc: "Enregistrée sur le site" },
                { id: 2, title: "Confirmée", desc: "Colis en préparation" },
                { id: 3, title: "En Livraison", desc: "Coursier en route" },
                { id: 4, title: "Livrée", desc: "Paiement effectué" },
              ];

              return (
                <div 
                  key={order.id || order.order_number || idx}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
                >
                  {/* Top Bar */}
                  <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        Commande #{order.order_number || order.id?.slice(0, 8)}
                      </div>
                      <h2 className="font-bold text-sm text-slate-900 mt-0.5">
                        {order.product_title || "Produit Sélectionné"}
                      </h2>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* STEPPER VISUEL APPLE/LINEAR GRADE */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                      Progression de votre colis
                    </div>

                    <div className="relative flex items-center justify-between">
                      {/* Ligne de fond */}
                      <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
                      {/* Ligne active */}
                      <div 
                        className="absolute left-4 top-4 -translate-y-1/2 h-1 bg-emerald-500 rounded-full transition-all duration-500 z-0"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%` 
                        }}
                      />

                      {steps.map((s) => {
                        const isCompleted = currentStep >= s.id;
                        const isCurrent = currentStep === s.id;

                        return (
                          <div key={s.id} className="relative z-1 flex flex-col items-center text-center max-w-[80px]">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-200 ${
                                isCompleted
                                  ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50"
                                  : "bg-white text-slate-400 border border-slate-200"
                              } ${isCurrent ? "ring-4 ring-emerald-100 scale-105" : ""}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : s.id}
                            </div>
                            <div className={`text-[11px] font-bold mt-2 ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                              {s.title}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight hidden sm:block mt-0.5">
                              {s.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DÉTAILS DE LIVRAISON */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white">
                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Destinataire</div>
                      <div className="font-bold text-slate-900">{order.customer_name}</div>
                      <div className="font-mono text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.customer_phone}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Lieu de livraison</div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{order.shipping_city || order.city || "Bénin"}</span>
                      </div>
                      <div className="text-slate-600 truncate">
                        {order.shipping_address || order.address || "Adresse précisée par appel"}
                      </div>
                    </div>
                  </div>

                  {/* FOOTER TOTAL & WHATSAPP */}
                  <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Total à régler à la livraison : </span>
                      <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                        {formattedPrice} FCFA
                      </span>
                    </div>

                    <a
                      href={`https://wa.me/2290192901817?text=${encodeURIComponent(`Bonjour, je souhaite des nouvelles de ma commande ${order.order_number || ""} (${order.customer_name}).`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Modifier adresse / Contacter coursier</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* REASSURANCE */}
        <div className="max-w-xl mx-auto pt-6 flex items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Paiement à la livraison</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Livraison express 24h</span>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Isivente — Tous droits réservés.</p>
      </footer>

    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RotateCw className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
