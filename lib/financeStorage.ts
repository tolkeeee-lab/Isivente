"use client";

export interface SubscriptionItem {
  id: string;
  name: string;
  category: "logiciel" | "telecom" | "marketing" | "equipe" | "autre";
  amount: number; // en FCFA par mois
  active: boolean;
  recurrence: "mensuel" | "annuel" | "hebdo";
}

export interface FinanceSettings {
  productCogs: Record<string, number>; // prix d'achat fournisseur unitaire en FCFA
  deliveryCostPerSuccess: number; // frais payés au livreur pour une livraison réussie
  deliveryCostPerFailure: number; // frais payés au livreur pour un retour/refus
  adSpendTotal: number; // dépenses publicitaires globales ou sur la période
  subscriptions: SubscriptionItem[]; // liste des abonnements et charges fixes
}

export const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  productCogs: {},
  deliveryCostPerSuccess: 0,
  deliveryCostPerFailure: 0,
  adSpendTotal: 0,
  subscriptions: [],
};

const STORAGE_KEY = "isivente_finance_settings_v1";

export function getFinanceSettings(): FinanceSettings {
  if (typeof window === "undefined") return DEFAULT_FINANCE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FINANCE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_FINANCE_SETTINGS,
      ...parsed,
      productCogs: {
        ...DEFAULT_FINANCE_SETTINGS.productCogs,
        ...(parsed.productCogs || {}),
      },
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : DEFAULT_FINANCE_SETTINGS.subscriptions,
    };
  } catch {
    return DEFAULT_FINANCE_SETTINGS;
  }
}

export function saveFinanceSettings(settings: FinanceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save finance settings:", err);
  }
}
