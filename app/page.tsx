import { ShoppingBag, TrendingUp, Package, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Isivente
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a 
              href="#features" 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
            >
              Fonctionnalit?s
            </a>
            <button className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition">
              Espace Vente
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-6">
          <ShieldCheck className="w-4 h-4" /> Architecture Isivente v1.0 initialis?e
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">
          La plateforme moderne pour piloter vos <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ventes & stocks</span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Point de vente ultra-rapide, synchronisation des inventaires en temps r?el, analyses financi?res et gestion automatis?e.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition">
            D?marrer une vente <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition">
            Consulter les stocks
          </button>
        </div>

        {/* Modules Grid */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Caisse & Encaissement</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Enregistrement fluide des transactions, impression de re?us et gestion multi-modes de paiement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inventaire & Alertes</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Suivi pr?cis des entr?es/sorties, alertes de r?approvisionnement et valorisation de stock.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rapports & Statistiques</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Chiffre d'affaires en direct, marges b?n?ficiaires, meilleurs vendeurs et tendances p?riodiques.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Isivente. Tous droits r?serv?s.
      </footer>
    </div>
  );
}
