export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface SaleItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
