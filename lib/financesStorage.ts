/**
 * financesStorage.ts - Module de gestion des dépenses réelles, ventes réelles et rentabilité nette Isivente
 * Persistance résiliente : API Serverless + Table Supabase `finances` + Cache LocalStorage sécurisé
 */

import { getStoredTenantContext } from "./storesStorage";

export type ExpenseCategory =
  | "ads"        // Publicités (Meta Ads, TikTok Ads)
  | "cogs"       // Achat de marchandises / Stock
  | "delivery"   // Frais réels de livraison / transporteurs
  | "telecom"    // Forfaits appels / WhatsApp / Connexion Internet
  | "packaging"  // Emballages, cartons, rubans, sachets
  | "salary"     // Commissions livreurs, salaires assistants
  | "other";     // Frais généraux ou imprévus

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  ads: {
    id: "ads",
    label: "Publicités (Meta / TikTok)",
    color: "#2563EB",
    badgeBg: "#EFF6FF",
    badgeText: "#1D4ED8",
    iconName: "Megaphone",
  },
  cogs: {
    id: "cogs",
    label: "Achat de Stock / Marchandises",
    color: "#7C3AED",
    badgeBg: "#F5F3FF",
    badgeText: "#6D28D9",
    iconName: "Boxes",
  },
  delivery: {
    id: "delivery",
    label: "Frais de Livraison / Expéditions",
    color: "#EA580C",
    badgeBg: "#FFF7ED",
    badgeText: "#C2410C",
    iconName: "Truck",
  },
  telecom: {
    id: "telecom",
    label: "Télécom & Internet (Appels / Data)",
    color: "#059669",
    badgeBg: "#ECFDF5",
    badgeText: "#047857",
    iconName: "PhoneCall",
  },
  packaging: {
    id: "packaging",
    label: "Emballages & Sachets",
    color: "#0891B2",
    badgeBg: "#ECFEFF",
    badgeText: "#0E7490",
    iconName: "Package",
  },
  salary: {
    id: "salary",
    label: "Commissions & Équipe",
    color: "#D97706",
    badgeBg: "#FFFBEB",
    badgeText: "#B45309",
    iconName: "Users",
  },
  other: {
    id: "other",
    label: "Autres dépenses diverses",
    color: "#64748B",
    badgeBg: "#F8FAFC",
    badgeText: "#475569",
    iconName: "Receipt",
  },
};

export interface ExpenseItem {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number; // en FCFA
  product_slug?: string; // optionnel (ex: 'game-stick-4k')
  description: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // en FCFA
  product_slug?: string;
  product_title?: string;
  quantity: number;
  order_number?: string; // Si relié à une commande officielle CMD-...
  customer_name?: string;
  city?: string;
  notes?: string;
  is_delivered_order?: boolean; // Vient du rapprochement des commandes du site
  created_at: string;
}

export interface DailyFinanceBreakdown {
  date: string; // YYYY-MM-DD
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  adsExpense: number;
  salesCount: number;
  expensesCount: number;
  roas: number; // totalSales / adsExpense (0 si pas de pub)
}

const EXPENSES_STORAGE_KEY = "isivente_cached_expenses";
const SALES_STORAGE_KEY = "isivente_cached_manual_sales";
const CAPITAL_STORAGE_KEY = "isivente_starting_capital";

/* ── Gestion Locale Sécurisée ── */
export function getLocalStartingCapital(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(CAPITAL_STORAGE_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (!Number.isNaN(n) && n >= 0) return Math.round(n);
    }
  } catch {}
  return 0;
}

export function saveLocalStartingCapital(amount: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAPITAL_STORAGE_KEY, String(Math.max(0, Math.round(Number(amount) || 0))));
  } catch {}
}

export function clearAllLocalFinances() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, "[]");
    localStorage.setItem(SALES_STORAGE_KEY, "[]");
    localStorage.setItem(CAPITAL_STORAGE_KEY, "0");
  } catch {}
}
export function getLocalExpenses(): ExpenseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalExpenses(expenses: ExpenseItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses.slice(0, 3000)));
  } catch {}
}

export function getLocalSales(): SaleItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalSales(sales: SaleItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales.slice(0, 3000)));
  } catch {}
}

/* ── Fonctions API avec bascule locale ── */
export async function fetchAllFinances(): Promise<{
  expenses: ExpenseItem[];
  sales: SaleItem[];
  startingCapital: number;
}> {
  const tenantCtx = getStoredTenantContext();
  const isTenantScoped = tenantCtx !== null && !tenantCtx.isFounder;
  const scopedStoreId = isTenantScoped ? (tenantCtx.storeId || "none") : null;

  try {
    const url = scopedStoreId
      ? `/api/finances?store_id=${encodeURIComponent(scopedStoreId)}`
      : "/api/finances";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.hasTable) {
        if (!isTenantScoped) {
          if (Array.isArray(data.expenses)) saveLocalExpenses(data.expenses);
          if (Array.isArray(data.sales)) saveLocalSales(data.sales);
          if (typeof data.startingCapital === "number") {
            saveLocalStartingCapital(data.startingCapital);
          }
        }
        return {
          expenses: data.expenses || [],
          sales: data.sales || [],
          startingCapital:
            typeof data.startingCapital === "number"
              ? data.startingCapital
              : isTenantScoped
              ? 0
              : getLocalStartingCapital(),
        };
      }
    }
  } catch (e) {
    console.warn("API finances inaccessible, repli sur le cache local:", e);
  }
  if (isTenantScoped) {
    return { expenses: [], sales: [], startingCapital: 0 };
  }
  return {
    expenses: getLocalExpenses(),
    sales: getLocalSales(),
    startingCapital: getLocalStartingCapital(),
  };
}

export async function updateStartingCapital(amount: number): Promise<number> {
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  const tenantCtx = getStoredTenantContext();
  const storeId = tenantCtx && !tenantCtx.isFounder ? tenantCtx.storeId : null;
  if (!storeId) saveLocalStartingCapital(cleanAmount);

  try {
    fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "capital",
        item: {
          id: storeId ? `capital_${storeId}` : "capital_initial",
          ...(storeId ? { store_id: storeId } : {}),
          amount: cleanAmount,
          date: new Date().toISOString().slice(0, 10),
          description: "Capital de départ en caisse",
        },
      }),
    }).catch(() => {});
  } catch {}

  return cleanAmount;
}

export async function addExpense(expense: Omit<ExpenseItem, "id" | "created_at">): Promise<ExpenseItem> {
  const tenantCtx = getStoredTenantContext();
  const storeId = tenantCtx && !tenantCtx.isFounder ? tenantCtx.storeId : null;
  const newExpense: ExpenseItem = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    amount: Math.round(Number(expense.amount) || 0),
    created_at: new Date().toISOString(),
  };

  if (!storeId) {
    const current = getLocalExpenses();
    const updated = [newExpense, ...current];
    saveLocalExpenses(updated);
  }

  // Synchroniser avec l'API
  try {
    fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "expense",
        item: { ...newExpense, ...(storeId ? { store_id: storeId } : {}) },
      }),
    }).catch(() => {});
  } catch {}

  return newExpense;
}

export async function removeExpense(id: string): Promise<boolean> {
  const current = getLocalExpenses();
  const updated = current.filter((e) => e.id !== id);
  saveLocalExpenses(updated);

  try {
    fetch(`/api/finances?id=${encodeURIComponent(id)}&type=expense`, {
      method: "DELETE",
    }).catch(() => {});
  } catch {}

  return true;
}

export async function addSale(sale: Omit<SaleItem, "id" | "created_at">): Promise<SaleItem> {
  const tenantCtx = getStoredTenantContext();
  const storeId = tenantCtx && !tenantCtx.isFounder ? tenantCtx.storeId : null;
  const newSale: SaleItem = {
    ...sale,
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    amount: Math.round(Number(sale.amount) || 0),
    quantity: Math.max(1, Number(sale.quantity) || 1),
    created_at: new Date().toISOString(),
  };

  if (!storeId) {
    const current = getLocalSales();
    const updated = [newSale, ...current];
    saveLocalSales(updated);
  }

  try {
    fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "sale",
        item: { ...newSale, ...(storeId ? { store_id: storeId } : {}) },
      }),
    }).catch(() => {});
  } catch {}

  return newSale;
}

export async function removeSale(id: string): Promise<boolean> {
  const current = getLocalSales();
  const updated = current.filter((s) => s.id !== id);
  saveLocalSales(updated);

  try {
    fetch(`/api/finances?id=${encodeURIComponent(id)}&type=sale`, {
      method: "DELETE",
    }).catch(() => {});
  } catch {}

  return true;
}

