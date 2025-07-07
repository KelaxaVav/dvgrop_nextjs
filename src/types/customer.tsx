export interface ICustomer {
  _id: string;
  name: string;
  nic: string;
  dob: string;
  address: string;
  phone: string;
  email : string;
  maritalStatus : string;
  occupation : string;
  income:number;
  bankAccount:string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

