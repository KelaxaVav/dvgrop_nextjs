
export interface IEmailSyncConfig {
  enabled: boolean;
  provider: 'internal' | 'mailchimp' | 'sendinblue' | 'google';
  apiKey?: string;
  listId?: string;
  syncOnCustomerRegistration: boolean;
  syncOnLoanApproval: boolean;
  lastSyncAt?: string;
}