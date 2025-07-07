import { createSlice } from "@reduxjs/toolkit";
import { ICustomer } from "../types/customer";

export interface CustomerState {
    customers: ICustomer[],
    total:null
}

const initialState: CustomerState = {
    customers: [],
    total: null
};

export const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setCustomers(state, action) {
            const { data, total } = action.payload;
            state.customers = data;
            state.total =total;
        },
        setCustomer(state, action) {
            const { data } = action.payload;
            state.customers = data;
        },
    }
})

export const { setCustomers } = customerSlice.actions;
export default customerSlice.reducer;