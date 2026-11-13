/**
 * financesStorage.ts - Module de gestion des dépenses réelles, ventes réelles et rentabilité nette Isivente
 * Persistance résiliente : API Serverless + Table Supabase `finances` + Cache LocalStorage sécurisé
 */

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

/* ── Gestion Locale Sécurisée ── */
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
}> {
  try {
    const res = await fetch("/api/finances", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.expenses)) {
        saveLocalExpenses(data.expenses);
      }
      if (data && Array.isArray(data.sales)) {
        saveLocalSales(data.sales);
      }
      return {
        expenses: data.expenses || getLocalExpenses(),
        sales: data.sales || getLocalSales(),
      };
    }
  } catch (e) {
    console.warn("API finances inaccessible, repli sur le cache local:", e);
  }
  return {
    expenses: getLocalExpenses(),
    sales: getLocalSales(),
  };
}

export async function addExpense(expense: Omit<ExpenseItem, "id" | "created_at">): Promise<ExpenseItem> {
  const newExpense: ExpenseItem = {
    ...expense,
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    amount: Math.round(Number(expense.amount) || 0),
    created_at: new Date().toISOString(),
  };

  // Mettre à jour localement immédiatement
  const current = getLocalExpenses();
  const updated = [newExpense, ...current];
  saveLocalExpenses(updated);

  // Synchroniser avec l'API
  try {
    fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "expense", item: newExpense }),
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
  const newSale: SaleItem = {
    ...sale,
    id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    amount: Math.round(Number(sale.amount) || 0),
    quantity: Math.max(1, Number(sale.quantity) || 1),
    created_at: new Date().toISOString(),
  };

  const current = getLocalSales();
  const updated = [newSale, ...current];
  saveLocalSales(updated);

  try {
    fetch("/api/finances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "sale", item: newSale }),
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

