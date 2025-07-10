import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Customer,
  Loan,
  Repayment,
  User,
  LoginLog,
  EmailContact,
  EmailSyncConfig,
} from "../types";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../types/redux_state";
import { setCustomers } from "../redux/customer_slice";
import { setLoans } from "../redux/loan_slice";
import Http from "../utils/http";
import { API_ROUTES } from "../utils/api_routes";
import { fetchCustomers, fetchLoans, fetchPayments, fetchUsers } from "../services/fetch";
import { ILoan } from "../types/loan";

interface DataContextType {
  customers: Customer[];
  loans: ILoan[];
  repayments: Repayment[];
  users: User[];
  loginLogs: LoginLog[];
  emailContacts: EmailContact[];
  emailSyncConfig: EmailSyncConfig | undefined;
  addCustomer: (
    customer: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addLoan: (loan: Omit<ILoan, "id" | "createdAt" | "updatedAt">) => void;
  updateLoan: (id: string, loan: Partial<ILoan>) => void;
  addRepayment: (repayment: Omit<Repayment, "id">) => void;
  updateRepayment: (id: string, repayment: Partial<Repayment>) => void;
  generateLoanSchedule: (loanId: string) => void;
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addLoginLog: (log: Omit<LoginLog, "id">) => void;
  addEmailContact: (
    contact: Omit<EmailContact, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateEmailContact: (id: string, contact: Partial<EmailContact>) => void;
  deleteEmailContact: (id: string) => void;
  updateEmailSyncConfig: (config: Partial<EmailSyncConfig>) => void;
  syncEmailContacts: () => Promise<{ success: number; failed: number }>;
  exportEmailContacts: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // const [customers, setCustomers] = useState<Customer[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [emailContacts, setEmailContacts] =
    useState<EmailContact[]>([]);
  const [emailSyncConfig, setEmailSyncConfig] = useState<EmailSyncConfig>();
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const dispatch = useDispatch();

  // Load data from localStorage on mount
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem("token"); // Adjust key name if different

  //       const headers = {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       };
  //       const [customersRes, loansRes, repaymentsRes, usersRes] =
  //         await Promise.all([
  //           fetchCustomers(dispatch),
  //           fetchLoans(dispatch),
  //           fetchPayments(dispatch),
  //           fetchUsers(dispatch)
  //         ]);

  //     } catch (err) {
  //       console.error("Error loading data from API:", err);
  //     }
  //   };
  //   fetchData();
  //   // const savedCustomers = localStorage.getItem('lms_customers');
  //   // const savedLoans = localStorage.getItem('lms_loans');
  //   // const savedRepayments = localStorage.getItem('lms_repayments');
  //   // const savedUsers = localStorage.getItem('lms_users');
  //   const savedLoginLogs = localStorage.getItem("lms_login_logs");
  //   const savedEmailContacts = localStorage.getItem("lms_email_contacts");
  //   const savedEmailSyncConfig = localStorage.getItem("lms_email_sync_config");

  //   // if (savedCustomers) {
  //   //   try {
  //   //     setCustomers(JSON.parse(savedCustomers));
  //   //   } catch (e) {
  //   //     console.error('Error loading customers from localStorage:', e);
  //   //   }
  //   // }
  //   // if (savedLoans) {
  //   //   try {
  //   //     setLoans(JSON.parse(savedLoans));
  //   //   } catch (e) {
  //   //     console.error('Error loading loans from localStorage:', e);
  //   //   }
  //   // }
  //   // if (savedRepayments) {
  //   //   try {
  //   //     setRepayments(JSON.parse(savedRepayments));
  //   //   } catch (e) {
  //   //     console.error('Error loading repayments from localStorage:', e);
  //   //   }
  //   // }
  //   // if (savedUsers) {
  //   //   try {
  //   //     setUsers(JSON.parse(savedUsers));
  //   //   } catch (e) {
  //   //     console.error('Error loading users from localStorage:', e);
  //   //   }
  //   // }
  //   if (savedLoginLogs) {
  //     try {
  //       setLoginLogs(JSON.parse(savedLoginLogs));
  //     } catch (e) {
  //       console.error("Error loading login logs from localStorage:", e);
  //     }
  //   }
  //   if (savedEmailContacts) {
  //     try {
  //       setEmailContacts(JSON.parse(savedEmailContacts));
  //     } catch (e) {
  //       console.error("Error loading email contacts from localStorage:", e);
  //     }
  //   }
  //   if (savedEmailSyncConfig) {
  //     try {
  //       setEmailSyncConfig(JSON.parse(savedEmailSyncConfig));
  //     } catch (e) {
  //       console.error("Error loading email sync config from localStorage:", e);
  //     }
  //   }
  // }, [dispatch]);

  // useEffect(() => {
  //   localStorage.setItem("lms_customers", JSON.stringify(customers));
  // }, [customers]);

  // useEffect(() => {
  //   localStorage.setItem("lms_loans", JSON.stringify(loans));
  // }, [loans]);

  // useEffect(() => {
  //   localStorage.setItem("lms_repayments", JSON.stringify(repayments));
  // }, [repayments]);

  // useEffect(() => {
  //   localStorage.setItem("lms_users", JSON.stringify(users));
  // }, [users]);

  // useEffect(() => {
  //   localStorage.setItem("lms_login_logs", JSON.stringify(loginLogs));
  // }, [loginLogs]);

  // useEffect(() => {
  //   localStorage.setItem("lms_email_contacts", JSON.stringify(emailContacts));
  // }, [emailContacts]);

  // useEffect(() => {
  //   localStorage.setItem(
  //     "lms_email_sync_config",
  //     JSON.stringify(emailSyncConfig)
  //   );
  // }, [emailSyncConfig]);

  useEffect(() => {
    if (emailSyncConfig?.enabled) {
      setEmailSyncConfig((prev:any) => ({
        ...prev,
        lastSyncAt: new Date().toISOString(),
      }));
    }
  }, [emailContacts, emailSyncConfig?.enabled]);

  const addCustomer = (
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => {
    const newCustomer: Customer = {
      ...customerData,
      _id: "C" + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev:any) => [...prev, newCustomer]);

    // Auto-add to email contacts if enabled and email exists
    if (emailSyncConfig?.syncOnCustomerRegistration && customerData.email) {
      addEmailContact({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        source: "customer_registration",
        customerId: newCustomer._id,
        syncStatus: "pending",
        isSubscribed: true,
        tags: ["customer", `${customerData.occupation.toLowerCase()}`],
      });
    }
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev:any) =>
      prev.map((customer:any) =>
        customer._id === id
          ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
          : customer
      )
    );

    // Update corresponding email contact if email is updated
    if (updates.email || updates.name || updates.phone) {
      const customer = customers?.find((c) => c._id === id);
      if (customer) {
        const contact = emailContacts?.find((c) => c.customerId === id);
        if (contact) {
          updateEmailContact(contact.id, {
            name: updates.name || customer.name,
            email: updates.email || customer.email,
            phone: updates.phone || customer.phone,
            updatedAt: new Date().toISOString(),
            syncStatus: "pending",
          });
        } else if (updates.email) {
          // Create new contact if email is now provided
          addEmailContact({
            name: customer.name,
            email: updates.email,
            phone: customer.phone,
            source: "customer_registration",
            customerId: customer._id,
            syncStatus: "pending",
            isSubscribed: true,
            tags: ["customer"],
          });
        }
      }
    }
  };

  const deleteCustomer = async(id: string) => {
    // setCustomers((prev:any) => prev.filter((customer:any) => customer._id !== id));
     try {
      const response = await Http.delete(`${API_ROUTES.CUSTOMERS}/${id}`);
      if (response.data.success) {
        fetchCustomers(dispatch)
      }
    } catch (error) {
      alert("Failed to delete customer.");
    }
    // Also remove related loans and repayments
    setLoans((prev:any) => prev.filter((loan:any) => loan.customerId._id !== id));
    // Remove related email contacts
    setEmailContacts((prev:any) =>
      prev.filter((contact:any) => contact.customerId !== id)
    );
  };

  const addLoan = (loanData:any) => {
    const newLoan = {
      ...loanData,
      _id: "L" + Date.now().toString(),
    };
    setLoans((prev:any) => [...prev, newLoan]);
  };

  const updateLoan = async (id: string, updates: Partial<ILoan>) => {
    setLoans((prev:any) =>
      prev.map((loan:any) =>
        loan._id === id
          ? { ...loan, ...updates, updatedAt: new Date().toISOString() }
          : loan
      )
    );
 let loan = loans?.find((l) => l._id === id);
    try {
      const token = localStorage.getItem("token"); // Adjust key name if different

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.put(
        "http://localhost:5000/api/v1/loans/"+id,
        {...loan, ...updates},
        { headers }
      );
     loan= response.data.data;
      // onSave(response.data.data); // optionally close form after save
    } catch (error) {
      console.error("Error saving customer:", error);
    }

    // If loan is approved and sync on approval is enabled, add customer to email contacts
    if (updates.status === "approved" && emailSyncConfig?.syncOnLoanApproval) {
     
      if (loan) {
        const customer = customers?.find((c) => c._id === loan.customerId._id);
        if (customer && customer.email) {
          // Check if contact already exists
          const existingContact = emailContacts?.find(
            (c) => c.customerId === customer._id
          );
          if (existingContact) {
            // Update existing contact with loan info
            updateEmailContact(existingContact.id, {
              loanId: id,
              tags: [...(existingContact.tags || []), "approved-loan"],
              syncStatus: "pending",
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Add new contact
            addEmailContact({
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              source: "loan_approval",
              customerId: customer._id,
              loanId: id,
              syncStatus: "pending",
              isSubscribed: true,
              tags: ["customer", "approved-loan"],
            });
          }
        }
      }
    }
  };

  const addRepayment = (repaymentData: Omit<Repayment, "id">) => {
    const newRepayment: Repayment = {
      ...repaymentData,
      id: "R" + Date.now().toString(),
    };
    setRepayments((prev:any) => [...prev, newRepayment]);
  };

  const updateRepayment = (id: string, updates: Partial<Repayment>) => {
    setRepayments((prev:any) =>
      prev.map((repayment:any) =>
        repayment.id === id ? { ...repayment, ...updates } : repayment
      )
    );
  };

  const generateLoanSchedule = (loanId: string) => {
    const loan = loans?.find((l) => l._id === loanId);
    if (!loan || !loan.approvedAmount || !loan.disbursedDate) return;

    // Remove existing repayments for this loan
    setRepayments((prev:any) => prev.filter((r:any) => r.loanId !== loanId));

    const schedule: Omit<Repayment, "id">[] = [];
    const startDate = new Date(loan.disbursedDate);

    for (let i = 1; i <= loan.period; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        loanId: loan._id,
        emiNo: i,
        dueDate: dueDate.toISOString().split("T")[0],
        amount: loan.emi,
        balance: loan.emi,
        status: "pending",
      });
    }

    schedule.forEach((repayment) => addRepayment(repayment));
  };

  const addUser = (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
    const newUser: User = {
      ...userData,
      _id: "U" + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocked: false,
      failedLoginAttempts: 0,
      isOnline: false,
    };
    setUsers((prev:any) => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev:any) =>
      prev.map((user:any) =>
        user._id === id
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev:any) => prev.filter((user:any) => user._id !== id));
    // Also remove related login logs
    setLoginLogs((prev:any) => prev.filter((log:any) => log.userId !== id));
  };

  const addLoginLog = (logData: Omit<LoginLog, "id">) => {
    const newLog: LoginLog = {
      ...logData,
      id: "LOG" + Date.now().toString(),
    };
    setLoginLogs((prev:any) => [...prev, newLog]);
  };

  // Email Contact Management Functions
  const addEmailContact = (
    contactData: Omit<EmailContact, "id" | "createdAt" | "updatedAt">
  ) => {
    // Check for duplicates
    const existingContact = emailContacts?.find(
      (c) => c.email.toLowerCase() === contactData.email.toLowerCase()
    );
    if (existingContact) {
      // Update existing contact instead of adding a duplicate
      updateEmailContact(existingContact.id, {
        ...contactData,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const newContact: EmailContact = {
      ...contactData,
      id: "EC" + Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmailContacts((prev:any) => [...prev, newContact]);
  };

  const updateEmailContact = (id: string, updates: Partial<EmailContact>) => {
    setEmailContacts((prev:any) =>
      prev.map((contact:any) =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
          : contact
      )
    );
  };

  const deleteEmailContact = (id: string) => {
    setEmailContacts((prev:any) => prev.filter((contact:any) => contact.id !== id));
  };

  const updateEmailSyncConfig = (config: Partial<EmailSyncConfig>) => {
    setEmailSyncConfig((prev:any) => ({
      ...prev,
      ...config,
    }));
  };

  // Simulate syncing with external email service
  const syncEmailContacts = async (): Promise<{
    success: number;
    failed: number;
  }> => {
    // This would be an API call to an external service in a real application
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate sync process
        let success = 0;
        let failed = 0;

        const updatedContacts = emailContacts?.map((contact) => {
          if (contact.syncStatus === "pending") {
            // 90% success rate for demo
            const isSuccess = Math.random() > 0.1;
            if (isSuccess) {
              success++;
              return {
                ...contact,
                syncStatus: "synced" as const,
                lastSyncedAt: new Date().toISOString(),
              };
            } else {
              failed++;
              return { ...contact, syncStatus: "failed" as const };
            }
          }
          return contact;
        });

        setEmailContacts(updatedContacts);
        setEmailSyncConfig((prev:any) => ({
          ...prev,
          lastSyncAt: new Date().toISOString(),
        }));

        resolve({ success, failed });
      }, 1500); // Simulate network delay
    });
  };

  // Export email contacts to CSV
  const exportEmailContacts = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Source",
      "Customer ID",
      "Loan ID",
      "Created At",
      "Sync Status",
      "Subscribed",
      "Tags",
    ];
    const csvData = emailContacts?.map((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.source,
      contact.customerId || "",
      contact.loanId || "",
      contact.createdAt,
      contact.syncStatus || "pending",
      contact.isSubscribed ? "Yes" : "No",
      (contact.tags || []).join(", "),
    ]);

    const csvContent = [headers, ...csvData ?? []]
      .map((row) => row.map((field:any) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DataContext.Provider
      value={{
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
        exportEmailContacts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
