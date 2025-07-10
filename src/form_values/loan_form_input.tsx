export interface LoanFormInputs {
  customerId: string;
  type: string;
  requestedAmount: number;
  interestRate: number;
  period: number;
  periodUnit: 'days' | 'weeks' | 'months';
  purpose: string;
  status: string;
  createdDate: string;
  guarantorName: string;
  guarantorNic: string;
  guarantorPhone: string;
  guarantorAddress: string;
  guarantorOccupation: string;
  guarantorIncome: number;
  collateralType: string;
  collateralDescription: string;
  collateralValue: number;
  sendSMS: boolean;
  documents: Document[];
}
