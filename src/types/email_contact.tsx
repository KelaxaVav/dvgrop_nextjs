export interface IEmailContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: 'customer_registration' | 'loan_approval' | 'manual_entry';
  customerId?: string;
  loanId?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'pending' | 'synced' | 'failed';
  lastSyncedAt?: string;
  tags?: string[];
  isSubscribed: boolean;
}
