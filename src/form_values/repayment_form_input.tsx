export interface RepaymentFormValues {
  amount: number;
  paymentDate: string;
  paymentMode: 'cash' | 'online' | 'cheque';
  penalty: number;
  remarks: string;
  receiptNumber: string;
  bankDetails: string;
  chequeNumber: string;
  chequeDate: string;
  sendSMS: boolean;
}