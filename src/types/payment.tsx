export interface IPayment {
  _id: string;
  loanId: {
    _id: string;
    customerId: {
      _id: string;
      name: string;
      phone: string;
    };
    type: string;
    period: number;
    emi: number;
  };
  emiNo: number;
  dueDate: string;    
  amount: number;
  paidAmount: number;
  balance: number;
  paymentDate: string;
  remarks: string;
  penalty: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMode:string;
  processedBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
