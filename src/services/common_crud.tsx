import { showToastError, showToastSuccess1 } from '../custom_component/toast';
import { API_ROUTES } from '../utils/api_routes';
import { fetchLoans } from '../utils/fetch';
import Http from '../utils/http';
import { Dispatch } from 'redux';

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
