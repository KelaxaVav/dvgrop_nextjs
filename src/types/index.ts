export interface Customer {
  _id: string;
  name: string;
  nic: string;
  dob: string;
  address: string;
  phone: string;
  email?: string;
  maritalStatus: 'married' | 'single';
  occupation: string;
  income: number;
  bankAccount?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  _id: string;
  loan_id: string;
  customerId: Customer,
  type: 'personal' | 'business' | 'agriculture' | 'vehicle' | 'housing';
  requestedAmount: number;
  approvedAmount?: number;
  interestRate: number;
  period: number;
  emi: number;
  startDate: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'completed';
  guarantor?: Guarantor;
  collateral?: Collateral;
  documents: Document[];
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  disbursedAmount?: number;
  disbursementMethod?: 'bank_transfer' | 'cash' | 'cheque';
  disbursementReference?: string;
  disbursedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guarantor {
  name: string;
  nic: string;
  phone: string;
  address: string;
  occupation: string;
  income: number;
}

export interface Collateral {
  type: string;
  description: string;
  value: number;
  // ownership: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Repayment {
  id: string;
  loanId: string;
  emiNo: number;
  dueDate: string;
  amount: number;
  paidAmount?: number;
  balance: number;
  paymentDate?: string;
  paymentMode?: 'cash' | 'online' | 'cheque';
  penalty?: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  remarks?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'officer' | 'clerk' | 'customer';
  name: string;
  phone: string;
  isActive: boolean;
  isLocked?: boolean;
  isOnline?: boolean;
  failedLoginAttempts?: number;
  lastLogin?: string;
  lastLogout?: string;
  createdAt: string;
  updatedAt?: string;
  requirePasswordChange?: boolean;
  twoFactorEnabled?: boolean;
  department?: string;
  employeeId?: string;
  permissions?: string[];
  sessionToken?: string;
  passwordLastChanged?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  status: 'success' | 'failed' | 'locked' | 'logout';
  failureReason?: string;
  sessionId?: string;
}

export interface Report {
  id: string;
  type: 'daily-collection' | 'upcoming-emi' | 'overdue-loans' | 'disbursement' | 'customer-history';
  title: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface EmailContact {
  id: string;
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

export interface EmailSyncConfig {
  enabled: boolean;
  provider: 'internal' | 'mailchimp' | 'sendinblue' | 'google';
  apiKey?: string;
  listId?: string;
  syncOnCustomerRegistration: boolean;
  syncOnLoanApproval: boolean;
  lastSyncAt?: string;
}