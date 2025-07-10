import { UseFormReset } from "react-hook-form";
import { Dispatch } from "redux";
import Http from "../utils/http";
import { showDeleteSuccess, showToastError, showToastSuccess, showToastSuccess1 } from "../custom_component/toast";
import { handleApiError } from "../utils/handle_api_error";
import { API_ROUTES } from "../utils/api_routes";
import { fetchLoans } from "./fetch";

export const submitData = async (
    requestData: any,
    isEditMode: boolean,
    typeId: string,
    fetchData: Function,
    onCancel: Function,
    setIsEditMode: Function,
    text: string,
    route: string,
    dispatch: Dispatch,
) => {
    let apiRoute = route;
    let apiCall = Http.post;

    if (isEditMode) {
        if (typeId) {
            apiCall = Http.put;
            apiRoute = `${route}/${typeId}`;
        }
    }

    try {
        const response = await apiCall(apiRoute, requestData);
        if (response.data.success === true) {
          
            await fetchData(dispatch);
            showToastSuccess(text, isEditMode);
            setIsEditMode(false);
            onCancel()
        } else {
            const errorMessage = response?.data?.meta?.message || 'Something went wrong!';
            showToastError(errorMessage);
        }

    } catch (error: unknown) {
        handleApiError(error, 'Failed to create');
    }
}

export const deleteType = async (fetchData: Function, text: string, route: string, dispatch: Dispatch) => {
    let apiRoute = route;
    let apiCall = Http.delete;
    try {
        await apiCall(apiRoute).then(async (response: { data: any; }) => {

            if (response.data.success === true) {
                await fetchData(dispatch);
                showDeleteSuccess(text);
            }
            else {
                const errorMessage = response?.data?.error || 'Something went wrong!';
                showToastError(errorMessage);
            }
        })
    }
    catch (error: unknown) {
        handleApiError(error, 'Failed to delete');
    }
}

export const handleClose = async (setShowModal: Function) => {
    setShowModal(false)
};

export const deleteClick = async (row: any, setShowModal: Function, setSelectedRow: Function,) => {
    setShowModal(true);
    setSelectedRow(row);
}

interface UpdateLoanStatusPayload {
  status: string;
  remarks?: string;
  approvedDate?: string;
  approvedAmount?: number;
}

export async function updateLoanStatus(
  loanId: string,
  payload: UpdateLoanStatusPayload,
  dispatch: Dispatch
): Promise<void> {
  try {
    console.log({ 'payload s': payload });
    const res = await Http.put(`${API_ROUTES.LOANS}/${loanId}`, payload);
    if (res?.data?.success) {
      showToastSuccess1('Loan status updated successfully');
      fetchLoans(dispatch);
    }
    else {
      showToastError('Failed to update loan status');
    }
  } catch (error) {
    showToastError('Failed to update loan status')
  }
}

