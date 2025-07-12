import { ICustomer } from "./customer";

export interface ILoan {
    _id: string;
    customerId: ICustomer;
    type: "personal" | "business" | "agriculture" | "vehicle" | "housing";
    requestedAmount: number;
    interestRate: number;
    period: number;
    emi: number;
    startDate: string;
    purpose: string;
    status: "pending" | "approved" | "rejected" | "disbursed" | "active" | "completed";
    guarantor?: Guarantor;
    collateral?: Collateral;
    documents: Document[];
    approvedBy?: {
        _id: string;
        name: string,
    };
    approvedDate?: string;
    disbursedDate?: string;
    disbursedAmount?: number;
    disbursementMethod?: 'bank_transfer' | 'cash' | 'cheque';
    disbursementReference?: string;
    disbursedBy?: {
         _id: string;
        name: string,
    };
     remarks?: string;
    createdBy?: {
        _id: string;
        name: string,
    };
    loan_id: string;
    approvedAmount?: number;
    createdAt: string;
    updatedAt: string;
    deleted_at: string | null;
}

export interface Collateral {
    type: string;
    description: string;
    value: number;
    _id: string;
}


export interface Guarantor {
    name: string;
    nic: string;
    phone: string;
    address: string;
    occupation: string;
    income: number;
    _id: string
}
export interface Document {
    _id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
}