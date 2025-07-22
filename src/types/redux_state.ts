import { AuthState } from "../redux/auth_slice";
import { CustomerState } from "../redux/customer_slice";
import { EmailContactState } from "../redux/email_contact_slice";
import { EmailSyncConfigState } from "../redux/email_sync_config_slice";
import { LoanState } from "../redux/loan_slice";
import { PaymentState } from "../redux/payment_slice";
import { UserState } from "../redux/user_slice";

export interface ReduxState {
    auth:AuthState,
    customer:CustomerState,
    loan:LoanState,
    payment:PaymentState,
    user:UserState,
    emailContact:EmailContactState,
    emailSyncConfig:EmailSyncConfigState
}