import { createSlice } from "@reduxjs/toolkit";
import { ILoan } from "../types/loan";

export interface LoanState {
    loans: ILoan[],
    count:null
}

const initialState: LoanState = {
    loans: [],
    count: null
};

export const loanSlice = createSlice({
    name: 'loan',
    initialState,
    reducers: {
        setLoans(state, action) {
            const { data, count } = action.payload;
            state.loans = data;
            state.count =count;
        },
    }
})

export const { setLoans } = loanSlice.actions;
export default loanSlice.reducer;