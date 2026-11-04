"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  Send,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Wallet,
  Smartphone
} from "lucide-react";
import { formatBeninPhoneDisplay, formatBeninPhoneForCall } from "@/lib/phoneUtils";

interface DeliveryOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  address: string;
  product_title: string;
  product_slug: string;
  bundle_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
}

function LivreurContent() {
  const searchParams = useSearchParams();
  const initialCmd = searchParams.get("cmd") || "";

  const [cmdInput, setCmdInput] = useState(initialCmd);
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successDelivered, setSuccessDelivered] = useState(false);

  // Mode de paiement encaissé
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo">("cash");

  // Volet de signalement de problème
  const [showIssuePanel, setShowIssuePanel] = useState(false);
  const [issueReason, setIssueReason] = useState("Client injoignable au téléphone");
  const [customReason, setCustomReason] = useState("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

  const fetchOrder = async (orderRef: string) => {
    if (!orderRef.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/delivery?cmd=${encodeURIComponent(orderRef.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        if (data.order.status === "delivered") {
          setSuccessDelivered(true);
        }
      } else {
        setErrorMsg(data.error || "Commande introuvable");
        setOrder(null);
      }
    } catch {
      setErrorMsg("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCmd) {
      fetchOrder(initialCmd);
    } else {
      setLoading(false);
    }
  }, [initialCmd]);

  // Validation de la livraison
  const handleConfirmDelivered = async () => {
    if (!order) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: order.order_number,
          action: "delivered",
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessDelivered(true);
      } else {
        alert(data.error || "Erreur lors de la validation");
      }
    } catch {
      alert("Erreur de connexion internet. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  // Signalement d'un problème
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmitting(true);
    const finalReason = issueReason === "Autre" ? customReason.trim() : issueReason;
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cmd: order.order_number,
          action: "issue",
          issueReason: finalReason || "Client non livré",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIssueSubmitted(true);
      } else {
        alert(data.error || "Erreur lors du signalement");
      }
    } catch {
      alert("Erreur de connexion internet. Réessayez dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* ── TOP BAR LOGO & SERVICE LIVRAISON ── */}
      <header className="w-full max-w-md flex items-center justify-between py-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
            ISV
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">ISIVENTE COURSIER</span>
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Portail Livraison Directe</span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
          Cotonou / Calavi
        </span>
      </header>

      <main className="w-full max-w-md space-y-4">

        {/* ── CHARGEMENT ── */}
        {loading && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">Recherche de la course en cours...</p>
          </div>
        )}

        {/* ── ÉCRAN DE SUCCÈS : LIVRAISON VALIDÉE ── */}
        {!loading && successDelivered && order && (
          <div className="bg-emerald-950/70 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider bg-emerald-900/90 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700 inline-block mb-2">
                Course Enregistrée avec Succès
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Colis Livré & Encaissé !
              </h2>
              <p className="text-xs text-emerald-200/90 mt-1.5 leading-relaxed">
                Le magasin a immédiatement reçu votre confirmation. La commande <strong>#{order.order_number}</strong> est classée livrée.
              </p>
            </div>

            {/* Récapitulatif montant encaissé */}
            <div className="bg-emerald-900/40 border border-emerald-700/60 rounded-2xl p-4 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-emerald-300">
                <span>Client :</span>
                <span className="font-bold text-white">{order.customer_name}</span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Montant encaissé :</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {fmt(order.total_amount)} FCFA
                </span>
              </div>
              <div className="flex justify-between text-emerald-300">
                <span>Mode d'encaissement :</span>
                <span className="font-semibold text-white">
                  {paymentMethod === "momo" ? "📱 Mobile Money" : "💵 Espèces"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-400 font-medium">
              Merci pour votre professionnalisme. Bonne route pour la suite de votre tournée !
            </p>
          </div>
        )}

        {/* ── ÉCRAN DE SIGNALEMENT RÉUSSI ── */}
        {!loading && issueSubmitted && order && (
          <div className="bg-amber-950/70 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Signalement Transmis</h2>
              <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                Votre remarque a bien été transmise à notre service client pour relance.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-3 text-xs text-slate-300 font-mono text-left border border-slate-800">
              Commande : #{order.order_number}<br />
              Motif : {issueReason === "Autre" ? customReason : issueReason}
            </div>
          </div>
        )}

        {/* ── CAS D'ERREUR OU SAISIE MANUELLE DU NUMÉRO DE COMMANDE ── */}
        {!loading && !order && !successDelivered && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-md text-left">
            <div>
              <h2 className="text-base font-bold text-white">Rechercher une course</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {errorMsg ? (
                  <span className="text-rose-400 font-medium">{errorMsg}</span>
                ) : (
                  "Entrez le numéro de commande figurant sur votre fiche de livraison."
                )}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchOrder(cmdInput);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="Ex: CMD-123456"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Afficher la commande</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ── FICHE DE COURSE PRINCIPALE DU LIVREUR ── */}
        {!loading && order && !successDelivered && !issueSubmitted && (
          <div className="space-y-4">

            {/* CARTE CLIENT & ADRESSE */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-5 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">N° Commande</span>
                  <span className="font-mono font-black text-white text-base">#{order.order_number}</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
                  En livraison
                </span>
              </div>

              {/* Destinataire & Appel Direct */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10.5px] uppercase tracking-wider text-slate-400 block">Client</span>
                  <p className="font-bold text-white text-sm sm:text-base truncate">{order.customer_name}</p>
                  <p className="font-mono text-xs text-slate-300 mt-0.5">{formatBeninPhoneDisplay(order.customer_phone)}</p>
                </div>

                {order.customer_phone && (
                  <a
                    href={`tel:${formatBeninPhoneForCall(order.customer_phone)}`}
                    className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4 fill-current" />
                    <span>Appeler</span>
                  </a>
                )}
              </div>

              {/* Destination & Quartier */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">{order.city}</p>
                  <p className="text-slate-300 text-[11.5px] mt-0.5 leading-relaxed">{order.address}</p>
                </div>
              </div>

              {/* Colis / Article */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
                <Package className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate">{order.product_title}</p>
                  <p className="text-[11px] text-slate-400">
                    Formule : {order.bundle_name.split("[OFFRE VIP]")[0].trim()} (x{order.quantity})
                  </p>
                </div>
              </div>
            </div>

            {/* 💰 ENCART MONTANT À ENCAISSER (Trame Haute Visibilité) */}
            <div className="bg-emerald-950/60 border-2 border-emerald-500/70 rounded-3xl p-5 text-center shadow-lg relative overflow-hidden">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                Montant Exact à Encaisser au Client
              </span>
              <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
                {fmt(order.total_amount)} <span className="text-emerald-400 text-xl font-mono">FCFA</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Paiement contre remboursement (COD)
              </p>

              {/* Sélecteur Mode de paiement */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-emerald-800/60 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-900/80 text-slate-300 border border-slate-700"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>💵 En Espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("momo")}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "momo"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "bg-slate-900/80 text-slate-300 border border-slate-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>📱 Mobile Money</span>
                </button>
              </div>
            </div>

            {/* 🚀 ACTION PRINCIPALE : BOUTON GÉANT CONFIRMER LA LIVRAISON */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmDelivered}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] disabled:opacity-50 text-slate-950 font-black text-base sm:text-lg py-4 px-6 rounded-2xl shadow-[0_12px_30px_-5px_rgba(37,211,102,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>{submitting ? "Validation en direct..." : "CONFIRMER COLIS LIVRÉ & ENCAISSÉ"}</span>
            </button>

            {/* ACTION SECONDAIRE : SIGNALER UN PROBLÈME */}
            {!showIssuePanel ? (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowIssuePanel(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 py-1 cursor-pointer transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Un problème sur cette livraison ? Cliquez ici</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportIssue} className="bg-slate-800/90 border border-amber-500/50 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Signaler un empêchement</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowIssuePanel(false)}
                    className="text-slate-400 hover:text-white text-[11px]"
                  >
                    Annuler
                  </button>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  {[
                    "Client injoignable au téléphone",
                    "Client absent (demande de repasser plus tard)",
                    "Client reporte à la paie de fin de mois",
                    "Client a refusé / annulé la commande",
                    "Autre",
                  ].map((reason) => (
                    <label key={reason} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                      <input
                        type="radio"
                        name="issueReason"
                        checked={issueReason === reason}
                        onChange={() => setIssueReason(reason)}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {issueReason === "Autre" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Précisez le problème..."
                    rows={2}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {submitting ? "Enregistrement..." : "Transmettre le signalement"}
                </button>
              </form>
            )}

          </div>
        )}

      </main>

      {/* FOOTER DISCRET */}
      <footer className="w-full max-w-md text-center py-6 mt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Portail Livreur Isivente Bénin • Transmission sécurisée</span>
      </footer>

    </div>
  );
}

export default function LivreurPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-slate-400 flex items-center justify-center text-xs">Chargement portail livreur...</div>}>
      <LivreurContent />
    </Suspense>
  );
}

