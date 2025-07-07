import { Dispatch } from "redux";
import { API_ROUTES } from "./api_routes";
import Http from "./http";
import { handleApiError } from "./handle_api_error";
import { setLoans } from "../redux/loan_slice";
import { setCustomers } from "../redux/customer_slice";

export const fetchLoans = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.LOANS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            console.log({'datadata':data.data});
            
            dispatch(setLoans({ data: data.data, total: data.count }));
        }
    } catch (error) {
        handleApiError(error, 'Failed to fetch loans');
    }
};
export const fetchCustomers = async (dispatch: Dispatch) => {
    try {
        const response = await Http.get(`${API_ROUTES.CUSTOMERS}`);
        const data = response.data;
        if (Array.isArray(data.data)) {
            dispatch(setCustomers({ data: data.data, count: data.count }));
        }
    } catch (error) {
        handleApiError(error, 'Failed to fetch Customer');
    }
};