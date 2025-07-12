import React, { useEffect, useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { ILoan } from '../../types/loan';
import { Controller, useForm } from 'react-hook-form';
import { LoanFormInputs } from '../../form_values/loan_form_input';
import Select from "react-select";
import { useSelectionOptions } from '../../custom_component/selection_options';
import DocumentUpload from './document';
import { ExampleCalculationResult, getEMIFrequency, getExampleCalculation, getInterestRateDisplay, getPeriodLabel } from './services/loan_utils';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';
import Http from '../../utils/http';
import { showToastError, showToastSuccess } from '../../custom_component/toast';
import { API_ROUTES } from '../../utils/api_routes';
import { subscribeLoading } from '../../utils/loading';
import PageLoader from '../../custom_component/loading';
import { Atom, Commet } from 'react-loading-indicators';
import { fetchLoans } from '../../services/fetch';

interface LoanFormProps {
  onCancel: () => void;
  isEditMode: boolean;
  loanId?: string;
}

export default function LoanForm({ onCancel, isEditMode, loanId }: LoanFormProps) {
  const { customerOptions, loanTypeOptions, periodUnitOptions } = useSelectionOptions();

  const { register, handleSubmit, control, watch, setValue } = useForm<LoanFormInputs>({
  });
  const dispatch = useDispatch();
  const formData = watch();
  const [emi, setEmi] = useState(0);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const [totalInterest, setTotalInterest] = useState(0);
  const [exampleCalc, setExampleCalc] = useState<ExampleCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeLoading(setLoading);
    return () => unsubscribe();
  }, []);

  const calculateSimpleInterestEMI = () => {
    const { requestedAmount, interestRate, period, periodUnit } = formData;

    if (requestedAmount && interestRate && period) {
      let installments = period;
      let periodInMonths = period;

      if (periodUnit === 'days') {
        periodInMonths = period / 30;
        installments = period;
      } else if (periodUnit === 'weeks') {
        periodInMonths = period / 4.33;
        installments = period;
      } else {
        periodInMonths = period;
        installments = period;
      }

      setTotalInstallments(installments);

      const simpleInterest = requestedAmount * (interestRate / 100) * periodInMonths;
      const totalAmountWithInterest = requestedAmount + simpleInterest;

      const calculatedEmi = totalAmountWithInterest / installments;

      setEmi(Math.round(calculatedEmi));
      setTotalAmount(Math.round(totalAmountWithInterest));
      setTotalInterest(Math.round(simpleInterest));
    }
  };

  React.useEffect(() => {
    calculateSimpleInterestEMI();
  }, [formData.requestedAmount, formData.interestRate, formData.period, formData.periodUnit]);

  const onSubmit = async (data: any) => {
    let periodInMonths = data.period;
    if (data.periodUnit === 'days') {
      periodInMonths = Math.ceil(data.period / 30);
    } else if (data.periodUnit === 'weeks') {
      periodInMonths = Math.ceil(data.period / 4.33);
    }

    const selectedCustomer = customers.find(c => c._id === data.customerId);

    if (!selectedCustomer) {
      alert('Customer not found');
      return;
    }

    const loanData = {
      customerId: selectedCustomer,
      type: data.type,
      requestedAmount: data.requestedAmount,
      interestRate: data.interestRate,
      period: periodInMonths,
      emi: emi,
      startDate: new Date().toISOString().split('T')[0],
      purpose: data.purpose,
      status: data.status,
      documents: Array.isArray(data.documents) ? data.documents : [],
      createdDate: data.createdDate,
      guarantor: data.guarantorName ? {
        name: data.guarantorName,
        nic: data.guarantorNic,
        phone: data.guarantorPhone,
        address: data.guarantorAddress,
        occupation: data.guarantorOccupation,
        income: data.guarantorIncome,
      } : undefined,
      collateral: data.collateralType ? {
        type: data.collateralType,
        description: data.collateralDescription,
        value: data.collateralValue,
      } : undefined,
    };

    try {
      if (isEditMode) {
        await Http.put(`${API_ROUTES.LOANS}/${loanId}`, loanData);
      }
      else {
        await Http.post(`${API_ROUTES.LOANS}`, loanData);
      }
      fetchLoans(dispatch);
      showToastSuccess('Loan', isEditMode);
      onCancel();
    } catch (error) {
      showToastError('Error saving loan')

    }
  };

  useEffect(() => {
    const { requestedAmount, interestRate, period, periodUnit } = formData;
    const calc = getExampleCalculation(requestedAmount, interestRate, period, periodUnit);
    setExampleCalc(calc);
  }, [formData.requestedAmount, formData.interestRate, formData.period, formData.periodUnit]);

  useEffect(() => {
    if (loanId && isEditMode) {
      const fetchLoanById = async () => {
        const response = await Http.get(`${API_ROUTES.LOANS}/${loanId}`);
        const data = response?.data?.data;
        if (data) {
          setValue('customerId', data?.customerId?._id);
          setValue('createdDate', data?.createdAt ? data.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
          setValue('type', data?.type);
          setValue('requestedAmount', data?.requestedAmount);
          setValue('interestRate', data?.interestRate);
          setValue('period', data?.period);
          setValue('periodUnit', 'months');
          setValue('purpose', data?.purpose);
          setValue('sendSMS', data?.sendSMS ?? true);
          setValue('guarantorName', data?.guarantor?.name);
          setValue('guarantorNic', data?.guarantor?.nic);
          setValue('guarantorPhone', data?.guarantor?.phone);
          setValue('guarantorAddress', data?.guarantor?.address);
          setValue('guarantorOccupation', data?.guarantor?.occupation);
          setValue('guarantorIncome', data?.guarantor?.income);
          setValue('collateralType', data?.collateral?.type);
          setValue('collateralDescription', data?.collateral?.description);
          setValue('collateralValue', data?.collateral?.value);
          const documentItems: DocumentItem[] = data?.documents?.map((doc: any) => ({
            _id: doc._id,
            name: doc.name,
            url: doc.url || doc.path || '',
            type: doc.type || ''
          })) ?? [];

          setValue('documents', documentItems);
          // setValue('documents', data?.documents ?? []);
        }
      }
      fetchLoanById();
    }
  }, [isEditMode, loanId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Loan Application' : 'New Loan Application'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Loan Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <Controller
                  name="customerId"
                  control={control}
                  rules={{ required: "Customer is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={customerOptions}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption ? selectedOption?.value : '');
                      }}
                      value={
                        customerOptions.find(option => option?.value === field?.value) || null
                      }
                      isClearable
                      placeholder="Select Customer"
                      classNamePrefix="react-select"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date *
                </label>
                <input
                  type="date"
                  {...register("createdDate", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Date when the loan application was submitted
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type *
                </label>
                <select
                  {...register("type", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {loanTypeOptions?.map(option => (
                    <option key={option?.value} value={option?.value}>
                      {option?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Amount (LKR) *
                </label>
                <input
                  type="number"
                  {...register('requestedAmount', { required: true, valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (% per month) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('interestRate', { required: true, valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getInterestRateDisplay(formData?.interestRate, formData?.periodUnit)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period *
                  </label>
                  <input
                    type="number"
                    {...register('period', { required: true, valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    {...register("periodUnit", { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  >
                    {periodUnitOptions?.map(option => (
                      <option key={option?.value} value={option?.value}>
                        {option?.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Loan period: {formData?.period} {getPeriodLabel(formData?.periodUnit).toLowerCase()} ({totalInstallments} installments)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose *
                </label>
                <textarea
                  {...register('purpose', { required: true })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendSMS"
                  {...register('sendSMS')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendSMS" className="ml-2 block text-sm text-gray-900">
                  Send application confirmation SMS to customer
                </label>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Simple Interest EMI</h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">LKR {emi?.toLocaleString()}</p>
                <p className="text-sm text-blue-700">{getEMIFrequency(formData?.periodUnit)}</p>
                <div className="mt-2 text-xs text-blue-600 space-y-1">
                  <p><strong>Principal:</strong> LKR {formData?.requestedAmount?.toLocaleString()}</p>
                  <p><strong>Total Amount:</strong> LKR {totalAmount?.toLocaleString()}</p>
                  <p><strong>Total Interest:</strong> LKR {totalInterest?.toLocaleString()}</p>
                  <p><strong>Number of Installments:</strong> {totalInstallments}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">✅ Simple Interest Formula:</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Interest = Principal × Rate × Time</strong></p>
                  <p><strong>Total = Principal + Interest</strong></p>
                  <p><strong>EMI = Total ÷ Installments</strong></p>
                  <hr className="my-2 border-green-300" />
                  <p>Interest = {formData?.requestedAmount?.toLocaleString()} × {formData?.interestRate}% × {formData?.periodUnit === 'days' ? (formData?.period / 30).toFixed(2) : formData?.periodUnit === 'weeks' ? (formData?.period / 4.33).toFixed(2) : formData?.period} months</p>
                  <p>Interest = LKR {totalInterest?.toLocaleString()}</p>
                  <p>Total = LKR {totalAmount?.toLocaleString()}</p>
                  <p>EMI = LKR {emi?.toLocaleString()} per {formData?.periodUnit?.slice(0, -1)}</p>
                </div>
              </div>

              {exampleCalc && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">📝 Example Verification:</h5>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>Your Example: 50,000 + 10% = 55,000 (1 month)</strong></p>
                    <p>✅ Principal: LKR {exampleCalc?.principal.toLocaleString()}</p>
                    <p>✅ Interest: LKR {exampleCalc?.interest.toLocaleString()}</p>
                    <p>✅ Total: LKR {exampleCalc?.total.toLocaleString()}</p>
                    <p>✅ EMI: LKR {Math.round(exampleCalc?.emi ?? 0).toLocaleString()}</p>
                    {exampleCalc?.periodInMonths && (
                      <p>Period: {exampleCalc?.periodInMonths} months</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Guarantor Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Name
                </label>
                <input
                  type="text"
                  {...register('guarantorName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor NIC
                </label>
                <input
                  type="text"
                  {...register('guarantorNic')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Phone
                </label>
                <input
                  type="tel"
                  {...register('guarantorPhone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Address
                </label>
                <textarea
                  rows={2}
                  {...register('guarantorAddress', { required: 'Guarantor address is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Occupation
                </label>
                <input
                  type="text"
                  {...register('guarantorOccupation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Income (LKR)
                </label>
                <input
                  type="number"
                  {...register('guarantorIncome', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <h4 className="text-md font-medium text-gray-800 border-b pb-2 mt-6">Collateral (Optional)</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collateral Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Property, Vehicle, Gold"
                  {...register('collateralType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  {...register('collateralDescription')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value (LKR)
                </label>
                <input
                  type="number"
                  {...register('collateralValue', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

              </div>
            </div>

            <div className="space-y-4">
              <DocumentUpload control={control} setValue={setValue} />

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Required Documents:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Customer NIC copy</li>
                  <li>• Income proof (salary slip/bank statement)</li>
                  <li>• Guarantor NIC copy</li>
                  <li>• Guarantor income proof</li>
                  <li>• Collateral ownership documents (if applicable)</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📚 Simple Interest Examples:</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="bg-white p-2 rounded">
                    <p><strong>Example 1:</strong> LKR 50,000 @ 10% for 1 month</p>
                    <p>Interest = 50,000 × 10% × 1 = LKR 5,000</p>
                    <p>Total = 50,000 + 5,000 = <strong>LKR 55,000</strong></p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p><strong>Example 2:</strong> LKR 50,000 @ 10% for 60 days</p>
                    <p>Interest = 50,000 × 10% × 2 months = LKR 10,000</p>
                    <p>Total = LKR 60,000 ÷ 60 days = <strong>LKR 1,000/day</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {/* {loading ? (
                <Atom color='#1E3A8A' />

              ) :
                (isEditMode ? 'Update Application' : 'Submit Application')
              } */}
              {
                isEditMode ? 'Update Application' : 'Submit Application'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}