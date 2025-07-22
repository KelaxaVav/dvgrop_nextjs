import { createSlice } from "@reduxjs/toolkit";
import { IEmailSyncConfig } from "../types/email_sync_config";

export interface EmailSyncConfigState {
    emailSyncConfigs: IEmailSyncConfig,
    count: null
}

const initialState: EmailSyncConfigState = {
    emailSyncConfigs: {
        enabled: false,
        provider: 'internal',
        syncOnCustomerRegistration: false,
        syncOnLoanApproval: false
    },
    count: null
};

export const emailSyncConfigSlice = createSlice({
    name: 'emailSyncConfig',
    initialState,
    reducers: {
        setEmailSyncConfigs(state, action) {
            const { data, count } = action.payload;
            state.emailSyncConfigs = data;
            state.count = count;
        },
    }
})

export const { setEmailSyncConfigs } = emailSyncConfigSlice.actions;
export default emailSyncConfigSlice.reducer;