import { ICustomer } from "./customer";

export interface ILoan {
    _id: string;
    customerId: ICustomer;
    type: string;
    requestedAmount: number;
    interestRate: number;
    period: number;
    emi: number;
    startDate: string;
    purpose: string;
    status: string;
    guarantor?: Guarantor;
    collateral?: Collateral;
    documents:any[],
    createdBy?: {
        _id: string;
        name: string,
    };
    loan_id?: string;
    approvedAmount?: number;
    createdAt: string;
    updated_at: string;
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
