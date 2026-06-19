export type UserRole = 'shopkeeper' | 'customer';

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  profileImage?: string;
  shopName?: string;
  shopLocation?: string;
  shopImage?: string;
  isEmailVerified?: boolean;
  isShopVerified?: boolean;
  shopVerificationStatus?: string;
  needsShopSetup?: boolean;
  isAdmin?: boolean;
  pendingLinkCount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  creditScore?: string;
  linkStatus?: string;
  status?: string;
  qrCode?: string;
  notes?: string;
  avatar?: string;
}

export interface LineItem {
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  items: LineItem[];
  total: number;
  note?: string;
  date?: string;
  time?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  method?: string;
  note?: string;
  date?: string;
  time?: string;
  receiptNo?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOutstanding: number;
  totalCredit: number;
  totalPayments: number;
  todayTransactions: number;
  weekCredit: number;
  weekPayment: number;
  customersWithDues: number;
}

export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  pendingLinkCount?: number;
  message?: string;
}
