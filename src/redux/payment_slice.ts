import { createSlice } from "@reduxjs/toolkit";
import { IPayment } from "../types/payment";

export interface PaymentState {
    payments: IPayment[],
    count:null
}

const initialState: PaymentState = {
    payments: [],
    count: null
};

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPayments(state, action) {
            const { data, count } = action.payload;
            state.payments = data;
            state.count =count;
        },
    }
})

export const { setPayments } = paymentSlice.actions;
export default paymentSlice.reducer;