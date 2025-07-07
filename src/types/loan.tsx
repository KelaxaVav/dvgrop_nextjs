export interface ILoan {
  id: number;
  branch_id: string;
  name: string;
  code: string;
  contact: string[];
  address: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

