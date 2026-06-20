export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Shopkeeper: undefined;
  Customer: undefined;
  AddCustomer: undefined;
  CustomerProfile: { customerId: string };
  EditCustomer: { customerId: string };
  FilteredCustomers: {
    mode: 'collect' | 'overdue';
    title: string;
    subtitle: string;
  };
  AddCredit: { customerId?: string; customerName?: string } | undefined;
  RecordPayment: { customerId: string; customerName?: string };
  LinkShops: undefined;
  ShopProfile: undefined;
  Products: undefined;
  Expenses: undefined;
  Security: undefined;
  HelpSupport: undefined;
  LegalDocument: { slug: string; title: string };
};

export type ShopkeeperTabParamList = {
  Dashboard: undefined;
  Customers: undefined;
  Scan: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type CustomerTabParamList = {
  MyDue: undefined;
  Ledger: undefined;
  Payments: undefined;
  Profile: undefined;
};
