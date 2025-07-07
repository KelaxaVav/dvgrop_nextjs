import { createSlice } from "@reduxjs/toolkit";
import { ILoan } from "../types/loan";

export interface LoanState {
    loans: ILoan[],
    total:null
}

const initialState: LoanState = {
    loans: [],
    total: null
};

export const loanSlice = createSlice({
    name: 'loan',
    initialState,
    reducers: {
        setLoans(state, action) {
            const { data, total } = action.payload;
            state.loans = data;
            state.total =total;
        },
    }
})

export const { setLoans } = loanSlice.actions;
export default loanSlice.reducer;