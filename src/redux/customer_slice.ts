import { createSlice } from "@reduxjs/toolkit";
import { ICustomer } from "../types/customer";

export interface CustomerState {
    customers: ICustomer[],
    count:null
}

const initialState: CustomerState = {
    customers: [],
    count: null
};

export const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        setCustomers(state, action) {
            const { data, count } = action.payload;
            state.customers = data;
            state.count =count;
        },
        setCustomer(state, action) {
            const { data } = action.payload;
            state.customers = data;
        },
    }
})

export const { setCustomers } = customerSlice.actions;
export default customerSlice.reducer;