import { Dispatch } from "redux";
import { API_ROUTES } from "./api_routes";
import Http from "./http";
import { handleApiError } from "./handle_api_error";
import { setLoans } from "../redux/loan_slice";
import { setCustomers } from "../redux/customer_slice";
import { setPayments } from "../redux/payment_slice";
import { ErrorConstant } from "../constants/error_constant_text";
import { setUsers } from "../redux/user_slice";

//FETCH LOANS//
export const fetchLoans = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.LOANS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            console.log({'datadata':data.data});
            
            dispatch(setLoans({ data: data.data, total: data.count }));
        }
    } catch (error) {
        handleApiError(error, ErrorConstant.failedToFetch);
    }
};

//FETCH CUSTOMERS//
export const fetchCustomers = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.CUSTOMERS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            dispatch(setCustomers({ data: data.data, count: data.count }));
        }
    } catch (error) {
        handleApiError(error, ErrorConstant.failedToFetch);
    }
};

//FETCH PAYMENT//
export const fetchPayments = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.PAYMENTS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            dispatch(setPayments({ data: data.data, count: data.count }));
        }
    } catch (error) {
        handleApiError(error, ErrorConstant.failedToFetch);
    }
};

//FETCH USERS//
export const fetchUsers = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.USERS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            dispatch(setUsers({ data: data.data, count: data.count }));
        }
    } catch (error) {
        handleApiError(error, ErrorConstant.failedToFetch);
    }
};