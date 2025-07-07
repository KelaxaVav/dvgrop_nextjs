export interface ILoan {
    _id: string;
    customerId: {
        _id: string,
        name: string,
        nic: string,
        phone: number
    };
    type: string;
    requestedAmount: string[];
    interestRate: number;
    period: number;
    emi: number;
    startDate: string;
    purpose: string;
    status: string;
    guarantor: {
        name: string,
        nic: string,
        phone: number,
        address: string,
        occupation: string,
        income: number,
        _id: string
    };
    collateral: {
        type: string;
        description: string;
        value: number;
        _id: string;
    };
    createdBy: {
        _id: string;
        name: string,
    };
    loan_id: string;
    approvedAmount:number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

