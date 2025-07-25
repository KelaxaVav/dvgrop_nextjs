import { useSelector } from "react-redux";
import { ReduxState } from "../types/redux_state";

export const useSelectionOptions = () => {
    const { customers } = useSelector((state: ReduxState) => state.customer);

    const customerOptions = customers.map(customer => ({
        value: customer._id,
        label: `${customer.name} - ${customer.nic}`,
    }));

    const loanTypeOptions = [
        { value: 'personal', label: 'Personal Loan' },
        { value: 'business', label: 'Business Loan' },
        { value: 'agriculture', label: 'Agriculture Loan' },
        { value: 'vehicle', label: 'Vehicle Loan' },
        { value: 'housing', label: 'Housing Loan' },
    ];
    const periodUnitOptions = [
        { value: 'days', label: 'Days' },
        { value: 'weeks', label: 'Weeks' },
        { value: 'months', label: 'Months' },
    ];

    const sourceOptions = [
        { value: 'manual_entry', label: 'Manual Entry' },
        { value: 'customer_registration', label: 'Customer Registration' },
        { value: 'loan_approval', label: 'Loan Approval' },
    ];

    return {
        customerOptions, loanTypeOptions,periodUnitOptions,sourceOptions
    }
}
