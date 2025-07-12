import { createSlice } from "@reduxjs/toolkit";
import { IEmailContact } from "../types/email_contact";

export interface EmailContactState {
    emailContacts: IEmailContact[],
    count:null
}

const initialState: EmailContactState = {
    emailContacts: [],
    count: null
};

export const emailContactSlice = createSlice({
    name: 'emailContacts',
    initialState,
    reducers: {
        setEmailContacts(state, action) {
            const { data, count } = action.payload;
            state.emailContacts = data;
            state.count =count;
        },
    }
})

export const { setEmailContacts } = emailContactSlice.actions;
export default emailContactSlice.reducer;