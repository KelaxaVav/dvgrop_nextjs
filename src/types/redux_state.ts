import { AuthState } from "../redux/auth_slice";
import { LoanState } from "../redux/loan_slice";

export interface ReduxState {
    auth:AuthState,
    loan:LoanState
}