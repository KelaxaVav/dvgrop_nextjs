export interface ICustomerDocument {
  _id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string; 
}

export interface ICustomer {
  _id: string;
  name: string;
  nic: string;
  dob: string; 
  address: string;
  phone: string;
  email: string;
  maritalStatus: "single" | "married"; 
  occupation: string;
  income: number;
  bankAccount: string;
  documents: any[];
  createdBy: string;
  createdAt: string; 
  updatedAt: string; 
  __v: number;
}


