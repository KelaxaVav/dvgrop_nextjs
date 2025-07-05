import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Loan, Repayment, User, LoginLog, EmailContact, EmailSyncConfig } from '../types';

interface DataContextType {
  customers: Customer[];
  loans: Loan[];
  repayments: Repayment[];
  users: User[];
  loginLogs: LoginLog[];
  emailContacts: EmailContact[];
  emailSyncConfig: EmailSyncConfig;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  addRepayment: (repayment: Omit<Repayment, 'id'>) => void;
  updateRepayment: (id: string, repayment: Partial<Repayment>) => void;
  generateLoanSchedule: (loanId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addLoginLog: (log: Omit<LoginLog, 'id'>) => void;
  addEmailContact: (contact: Omit<EmailContact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmailContact: (id: string, contact: Partial<EmailContact>) => void;
  deleteEmailContact: (id: string) => void;
  updateEmailSyncConfig: (config: Partial<EmailSyncConfig>) => void;
  syncEmailContacts: () => Promise<{ success: number; failed: number }>;
  exportEmailContacts: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Kamal Perera',
    nic: '199012345678',
    dob: '1990-05-15',
    address: 'No. 123, Galle Road, Colombo 03',
    phone: '+94771234567',
    email: 'kamal@email.com',
    maritalStatus: 'married',
    occupation: 'Business Owner',
    income: 75000,
    bankAccount: '1234567890',
    documents: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Nimal Silva',
    nic: '198509876543',
    dob: '1985-12-20',
    address: 'No. 456, Kandy Road, Peradeniya',
    phone: '+94779876543',
    email: 'nimal@email.com',
    maritalStatus: 'single',
    occupation: 'Government Employee',
    income: 50000,
    documents: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
];

const initialLoans: Loan[] = [
  {
    id: 'L001',
    customerId: '1',
    type: 'business',
    requestedAmount: 500000,
    approvedAmount: 450000,
    interestRate: 10,
    period: 24,
    emi: 22500,
    startDate: '2024-02-01',
    purpose: 'Business Expansion',
    status: 'active',
    approvedBy: 'Loan Officer',
    approvedDate: '2024-01-20T00:00:00Z',
    disbursedDate: '2024-02-01T00:00:00Z',
    disbursedAmount: 450000,
    disbursementMethod: 'bank_transfer',
    disbursementReference: 'BANK001234',
    disbursedBy: 'System Admin',
    documents: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: 'L002',
    customerId: '2',
    type: 'personal',
    requestedAmount: 200000,
    approvedAmount: 180000,
    interestRate: 10,
    period: 12,
    emi: 16500,
    startDate: '2024-03-01',
    purpose: 'Home Renovation',
    status: 'approved',
    approvedBy: 'Loan Officer',
    approvedDate: '2024-02-20T00:00:00Z',
    documents: [],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  },
  {
    id: 'L003',
    customerId: '1',
    type: 'vehicle',
    requestedAmount: 300000,
    interestRate: 10,
    period: 18,
    emi: 18333,
    startDate: '2024-04-01',
    purpose: 'Vehicle Purchase',
    status: 'pending',
    documents: [],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  }
];

const initialRepayments: Repayment[] = [
  {
    id: 'R001',
    loanId: 'L001',
    emiNo: 1,
    dueDate: '2024-03-01',
    amount: 22500,
    paidAmount: 22500,
    balance: 0,
    paymentDate: '2024-03-01',
    paymentMode: 'cash',
    status: 'paid'
  },
  {
    id: 'R002',
    loanId: 'L001',
    emiNo: 2,
    dueDate: '2024-04-01',
    amount: 22500,
    balance: 22500,
    status: 'pending'
  }
];

const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@loanmanager.com',
    role: 'admin',
    name: 'System Administrator',
    phone: '+94771234567',
    isActive: true,
    isOnline: false,
    failedLoginAttempts: 0,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
    department: 'IT',
    employeeId: 'EMP001',
    twoFactorEnabled: true
  },
  {
    id: '2',
    username: 'officer',
    email: 'officer@loanmanager.com',
    role: 'officer',
    name: 'Loan Officer',
    phone: '+94771234568',
    isActive: true,
    isOnline: true,
    failedLoginAttempts: 0,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T09:15:00Z',
    department: 'Loans',
    employeeId: 'EMP002'
  },
  {
    id: '3',
    username: 'clerk',
    email: 'clerk@loanmanager.com',
    role: 'clerk',
    name: 'Data Entry Clerk',
    phone: '+94771234569',
    isActive: true,
    isOnline: false,
    failedLoginAttempts: 1,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T08:45:00Z',
    department: 'Operations',
    employeeId: 'EMP003'
  }
];

const initialLoginLogs: LoginLog[] = [
  {
    id: 'LOG001',
    userId: '1',
    loginTime: '2024-01-15T10:30:00Z',
    logoutTime: '2024-01-15T16:45:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    location: 'Colombo, Sri Lanka',
    status: 'success',
    sessionId: 'sess_001'
  },
  {
    id: 'LOG002',
    userId: '2',
    loginTime: '2024-01-15T09:15:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    location: 'Kandy, Sri Lanka',
    status: 'success',
    sessionId: 'sess_002'
  },
  {
    id: 'LOG003',
    userId: '3',
    loginTime: '2024-01-15T08:45:00Z',
    logoutTime: '2024-01-15T17:00:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    location: 'Galle, Sri Lanka',
    status: 'success',
    sessionId: 'sess_003'
  },
  {
    id: 'LOG004',
    userId: '3',
    loginTime: '2024-01-14T14:20:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    location: 'Galle, Sri Lanka',
    status: 'failed',
    failureReason: 'Invalid password'
  }
];

// Initial email contacts based on existing customers
const initialEmailContacts: EmailContact[] = [
  {
    id: 'EC001',
    name: 'Kamal Perera',
    email: 'kamal@email.com',
    phone: '+94771234567',
    source: 'customer_registration',
    customerId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    syncStatus: 'pending',
    isSubscribed: true,
    tags: ['customer', 'business-loan']
  },
  {
    id: 'EC002',
    name: 'Nimal Silva',
    email: 'nimal@email.com',
    phone: '+94779876543',
    source: 'customer_registration',
    customerId: '2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    syncStatus: 'pending',
    isSubscribed: true,
    tags: ['customer', 'personal-loan']
  }
];

// Initial email sync configuration
const initialEmailSyncConfig: EmailSyncConfig = {
  enabled: true,
  provider: 'internal',
  syncOnCustomerRegistration: true,
  syncOnLoanApproval: false,
  lastSyncAt: '2024-01-02T00:00:00Z'
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [repayments, setRepayments] = useState<Repayment[]>(initialRepayments);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(initialLoginLogs);
  const [emailContacts, setEmailContacts] = useState<EmailContact[]>(initialEmailContacts);
  const [emailSyncConfig, setEmailSyncConfig] = useState<EmailSyncConfig>(initialEmailSyncConfig);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('lms_customers');
    const savedLoans = localStorage.getItem('lms_loans');
    const savedRepayments = localStorage.getItem('lms_repayments');
    const savedUsers = localStorage.getItem('lms_users');
    const savedLoginLogs = localStorage.getItem('lms_login_logs');
    const savedEmailContacts = localStorage.getItem('lms_email_contacts');
    const savedEmailSyncConfig = localStorage.getItem('lms_email_sync_config');
    
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        console.error('Error loading customers from localStorage:', e);
      }
    }
    if (savedLoans) {
      try {
        setLoans(JSON.parse(savedLoans));
      } catch (e) {
        console.error('Error loading loans from localStorage:', e);
      }
    }
    if (savedRepayments) {
      try {
        setRepayments(JSON.parse(savedRepayments));
      } catch (e) {
        console.error('Error loading repayments from localStorage:', e);
      }
    }
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error loading users from localStorage:', e);
      }
    }
    if (savedLoginLogs) {
      try {
        setLoginLogs(JSON.parse(savedLoginLogs));
      } catch (e) {
        console.error('Error loading login logs from localStorage:', e);
      }
    }
    if (savedEmailContacts) {
      try {
        setEmailContacts(JSON.parse(savedEmailContacts));
      } catch (e) {
        console.error('Error loading email contacts from localStorage:', e);
      }
    }
    if (savedEmailSyncConfig) {
      try {
        setEmailSyncConfig(JSON.parse(savedEmailSyncConfig));
      } catch (e) {
        console.error('Error loading email sync config from localStorage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('lms_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('lms_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('lms_repayments', JSON.stringify(repayments));
  }, [repayments]);

  useEffect(() => {
    localStorage.setItem('lms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lms_login_logs', JSON.stringify(loginLogs));
  }, [loginLogs]);

  useEffect(() => {
    localStorage.setItem('lms_email_contacts', JSON.stringify(emailContacts));
  }, [emailContacts]);

  useEffect(() => {
    localStorage.setItem('lms_email_sync_config', JSON.stringify(emailSyncConfig));
  }, [emailSyncConfig]);

  // Auto-sync email contacts when a new customer is added or a loan is approved
  useEffect(() => {
    if (emailSyncConfig.enabled) {
      // This would be a more sophisticated sync in a real application
      // For now, we'll just update the lastSyncAt timestamp
      setEmailSyncConfig(prev => ({
        ...prev,
        lastSyncAt: new Date().toISOString()
      }));
    }
  }, [emailContacts, emailSyncConfig.enabled]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: 'C' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);

    // Auto-add to email contacts if enabled and email exists
    if (emailSyncConfig.syncOnCustomerRegistration && customerData.email) {
      addEmailContact({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        source: 'customer_registration',
        customerId: newCustomer.id,
        syncStatus: 'pending',
        isSubscribed: true,
        tags: ['customer', `${customerData.occupation.toLowerCase()}`]
      });
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id 
        ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
        : customer
    ));

    // Update corresponding email contact if email is updated
    if (updates.email || updates.name || updates.phone) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        const contact = emailContacts.find(c => c.customerId === id);
        if (contact) {
          updateEmailContact(contact.id, {
            name: updates.name || customer.name,
            email: updates.email || customer.email,
            phone: updates.phone || customer.phone,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending'
          });
        } else if (updates.email) {
          // Create new contact if email is now provided
          addEmailContact({
            name: customer.name,
            email: updates.email,
            phone: customer.phone,
            source: 'customer_registration',
            customerId: customer.id,
            syncStatus: 'pending',
            isSubscribed: true,
            tags: ['customer']
          });
        }
      }
    }
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
    // Also remove related loans and repayments
    setLoans(prev => prev.filter(loan => loan.customerId !== id));
    // Remove related email contacts
    setEmailContacts(prev => prev.filter(contact => contact.customerId !== id));
  };

  const addLoan = (loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: 'L' + Date.now().toString(),
      createdAt: loanData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLoans(prev => [...prev, newLoan]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(loan => 
      loan.id === id 
        ? { ...loan, ...updates, updatedAt: new Date().toISOString() }
        : loan
    ));

    // If loan is approved and sync on approval is enabled, add customer to email contacts
    if (updates.status === 'approved' && emailSyncConfig.syncOnLoanApproval) {
      const loan = loans.find(l => l.id === id);
      if (loan) {
        const customer = customers.find(c => c.id === loan.customerId);
        if (customer && customer.email) {
          // Check if contact already exists
          const existingContact = emailContacts.find(c => c.customerId === customer.id);
          if (existingContact) {
            // Update existing contact with loan info
            updateEmailContact(existingContact.id, {
              loanId: id,
              tags: [...(existingContact.tags || []), 'approved-loan'],
              syncStatus: 'pending',
              updatedAt: new Date().toISOString()
            });
          } else {
            // Add new contact
            addEmailContact({
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              source: 'loan_approval',
              customerId: customer.id,
              loanId: id,
              syncStatus: 'pending',
              isSubscribed: true,
              tags: ['customer', 'approved-loan']
            });
          }
        }
      }
    }
  };

  const addRepayment = (repaymentData: Omit<Repayment, 'id'>) => {
    const newRepayment: Repayment = {
      ...repaymentData,
      id: 'R' + Date.now().toString()
    };
    setRepayments(prev => [...prev, newRepayment]);
  };

  const updateRepayment = (id: string, updates: Partial<Repayment>) => {
    setRepayments(prev => prev.map(repayment => 
      repayment.id === id ? { ...repayment, ...updates } : repayment
    ));
  };

  const generateLoanSchedule = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan || !loan.approvedAmount || !loan.disbursedDate) return;

    // Remove existing repayments for this loan
    setRepayments(prev => prev.filter(r => r.loanId !== loanId));

    const schedule: Omit<Repayment, 'id'>[] = [];
    const startDate = new Date(loan.disbursedDate);

    for (let i = 1; i <= loan.period; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        loanId: loan.id,
        emiNo: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: loan.emi,
        balance: loan.emi,
        status: 'pending'
      });
    }

    schedule.forEach(repayment => addRepayment(repayment));
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'U' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocked: false,
      failedLoginAttempts: 0,
      isOnline: false
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, ...updates, updatedAt: new Date().toISOString() }
        : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also remove related login logs
    setLoginLogs(prev => prev.filter(log => log.userId !== id));
  };

  const addLoginLog = (logData: Omit<LoginLog, 'id'>) => {
    const newLog: LoginLog = {
      ...logData,
      id: 'LOG' + Date.now().toString()
    };
    setLoginLogs(prev => [...prev, newLog]);
  };

  // Email Contact Management Functions
  const addEmailContact = (contactData: Omit<EmailContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check for duplicates
    const existingContact = emailContacts.find(c => c.email.toLowerCase() === contactData.email.toLowerCase());
    if (existingContact) {
      // Update existing contact instead of adding a duplicate
      updateEmailContact(existingContact.id, {
        ...contactData,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    const newContact: EmailContact = {
      ...contactData,
      id: 'EC' + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEmailContacts(prev => [...prev, newContact]);
  };

  const updateEmailContact = (id: string, updates: Partial<EmailContact>) => {
    setEmailContacts(prev => prev.map(contact => 
      contact.id === id 
        ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
        : contact
    ));
  };

  const deleteEmailContact = (id: string) => {
    setEmailContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const updateEmailSyncConfig = (config: Partial<EmailSyncConfig>) => {
    setEmailSyncConfig(prev => ({
      ...prev,
      ...config
    }));
  };

  // Simulate syncing with external email service
  const syncEmailContacts = async (): Promise<{ success: number; failed: number }> => {
    // This would be an API call to an external service in a real application
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate sync process
        let success = 0;
        let failed = 0;

        const updatedContacts = emailContacts.map(contact => {
          if (contact.syncStatus === 'pending') {
            // 90% success rate for demo
            const isSuccess = Math.random() > 0.1;
            if (isSuccess) {
              success++;
              return { ...contact, syncStatus: 'synced' as const, lastSyncedAt: new Date().toISOString() };
            } else {
              failed++;
              return { ...contact, syncStatus: 'failed' as const };
            }
          }
          return contact;
        });

        setEmailContacts(updatedContacts);
        setEmailSyncConfig(prev => ({
          ...prev,
          lastSyncAt: new Date().toISOString()
        }));

        resolve({ success, failed });
      }, 1500); // Simulate network delay
    });
  };

  // Export email contacts to CSV
  const exportEmailContacts = () => {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Customer ID', 'Loan ID', 'Created At', 'Sync Status', 'Subscribed', 'Tags'];
    const csvData = emailContacts.map(contact => [
      contact.name,
      contact.email,
      contact.phone,
      contact.source,
      contact.customerId || '',
      contact.loanId || '',
      contact.createdAt,
      contact.syncStatus || 'pending',
      contact.isSubscribed ? 'Yes' : 'No',
      (contact.tags || []).join(', ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DataContext.Provider value={{
      customers,
      loans,
      repayments,
      users,
      loginLogs,
      emailContacts,
      emailSyncConfig,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addLoan,
      updateLoan,
      addRepayment,
      updateRepayment,
      generateLoanSchedule,
      addUser,
      updateUser,
      deleteUser,
      addLoginLog,
      addEmailContact,
      updateEmailContact,
      deleteEmailContact,
      updateEmailSyncConfig,
      syncEmailContacts,
      exportEmailContacts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}