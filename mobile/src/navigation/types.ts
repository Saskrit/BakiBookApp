export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Shopkeeper: undefined;
  Customer: undefined;
  AddCustomer: undefined;
  CustomerProfile: { customerId: string };
  AddCredit: { customerId: string; customerName?: string };
  RecordPayment: { customerId: string; customerName?: string };
  LinkShops: undefined;
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
