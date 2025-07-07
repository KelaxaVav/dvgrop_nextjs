export interface ILoan {
    _id: string;
    customerId: {
        _id: string,
        name: string,
        nic: string,
        phone: Number
    };
    type: string;
    requestedAmount: string[];
    interestRate: Number;
    period: Number;
    emi: Number;
    startDate: string;
    purpose: string;
    status: string;
    guarantor: {
        name: string,
        nic: string,
        phone: Number,
        address: string,
        occupation: string,
        income: Number,
        _id: string
    };
    collateral: {
        type: string;
        description: string;
        value: Number;
        _id: string;
    };
    createdBy: {
        _id: string;
        name: string,
    };
    loan_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

