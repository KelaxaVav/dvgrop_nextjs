import { Dispatch } from "redux";
import Http from "../../../utils/http";
import { API_ROUTES } from "../../../utils/api_routes";
import { fetchLoans } from "../../../services/fetch";
import { showToastError, showToastSuccess1 } from "../../../custom_component/toast";

export interface ExampleCalculationResult {
  principal: number;
  interest: number;
  total: number;
  emi: number;
  periodInMonths?: number;
  isExample: boolean;
}

export type PeriodUnit = 'days' | 'weeks' | 'months' | string;

export function getExampleCalculation(
  requestedAmount: number,
  interestRate: number,
  period: number,
  periodUnit: PeriodUnit
): ExampleCalculationResult | null {
  if (requestedAmount === 50000 && interestRate === 10 && period === 1 && periodUnit === 'months') {
    return {
      principal: 50000,
      interest: 5000, 
      total: 55000,
      emi: 55000,
      isExample: true,
    };
  }

  if (requestedAmount === 50000 && interestRate === 10 && period === 60 && periodUnit === 'days') {
    const periodInMonths = 60 / 30;
    const interest = 50000 * 0.10 * periodInMonths; 
    const total = 50000 + interest; 
    const dailyEmi = total / 60; 

    return {
      principal: 50000,
      interest: interest,
      total: total,
      emi: dailyEmi,
      periodInMonths: periodInMonths,
      isExample: true,
    };
  }

  return null;
}

export function getPeriodLabel(periodUnit: PeriodUnit): string {
  switch (periodUnit) {
    case 'days':
      return 'Days';
    case 'weeks':
      return 'Weeks';
    case 'months':
      return 'Months';
    default:
      return 'Months';
  }
}

export function getEMIFrequency(periodUnit: PeriodUnit): string {
  switch (periodUnit) {
    case 'days':
      return 'Daily installment';
    case 'weeks':
      return 'Weekly installment';
    case 'months':
      return 'Monthly installment';
    default:
      return 'Monthly installment';
  }
}

export function getInterestRateDisplay(rate: number, periodUnit: PeriodUnit): string {
  let unitLabel: string;

  switch (periodUnit) {
    case 'days':
      unitLabel = 'per day';
      break;
    case 'weeks':
      unitLabel = 'per week';
      break;
    case 'months':
    default:
      unitLabel = 'per month';
      break;
  }

  return `${rate}% ${unitLabel} (Simple Interest)`;
}

interface UpdateLoanStatusPayload {
  status: string;
  remarks?: string;
  approvedDate?: string;
  approvedBy?: string;
  approvedAmount?: number;
  disbursedDate?:string;
  disbursedAmount?:string;
  disbursementMethod?:string;
  disbursementReference?:string;
  disbursedBy?:string;

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