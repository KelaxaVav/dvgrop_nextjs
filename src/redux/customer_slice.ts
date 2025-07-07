import { createSlice } from "@reduxjs/toolkit";

export interface CustomerState {
    customers: any[],
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