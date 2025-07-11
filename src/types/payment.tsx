export interface IPayment {
  _id: string;
  status:string;
  paymentDate:string;
  paidAmount:number
  amount:number
  dueDate:string;
  loanId:string;
  emiNo:string;
}
export interface IRepayment {
  _id: string;
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

