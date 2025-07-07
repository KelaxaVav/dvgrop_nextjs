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

