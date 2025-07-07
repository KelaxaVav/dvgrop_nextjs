import { AuthState } from "../redux/auth_slice";
import { CustomerState } from "../redux/customer_slice";
import { LoanState } from "../redux/loan_slice";

export interface ReduxState {
    auth:AuthState,
    customer:CustomerState,
    loan:LoanState
}