export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  name: string;
  phone: string;
  isActive: boolean;
  isLocked: boolean;
  isOnline: boolean;
  failedLoginAttempts: number;
  requirePasswordChange: boolean;
  twoFactorEnabled: boolean;
  department: string;
  employeeId: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  passwordLastChanged: string;
  __v: number;
  lastLogin: string;
  sessionToken: string;
}