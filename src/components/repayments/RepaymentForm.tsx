import { X, DollarSign, CreditCard, Banknote, Building, AlertTriangle, Calculator } from 'lucide-react';
import { IPayment } from '../../types/payment';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';
import { Controller, useForm } from 'react-hook-form';
import { RepaymentFormValues } from '../../form_values/repayment_form_input';

interface RepaymentFormProps {
  repayment: IPayment;
  onSave: (paymentData: any) => void;
  onCancel: () => void;
}


export default function RepaymentForm({ repayment, onSave, onCancel }: RepaymentFormProps) {
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  const { user } = useSelector((state: ReduxState) => state.auth);

  const loan = loans.find(l => l._id === repayment?.loanId?._id);
  const customer = customers.find(c => c._id === loan?.customerId);

  // const [formData, setFormData] = useState({
  //   amount: repayment.balance || repayment.amount,
  //   paymentDate: new Date().toISOString().split('T')[0],
  //   paymentMode: 'cash' as 'cash' | 'online' | 'cheque',
  //   penalty: 0,
  //   remarks: '',
  //   receiptNumber: '',
  //   bankDetails: '',
  //   chequeNumber: '',
  //   chequeDate: '',
  //   sendSMS: true
  // });
  // Calculate penalty for overdue payments
  const calculatePenalty = () => {
    const dueDate = new Date(repayment.dueDate);
    const today = new Date();

    if (today <= dueDate) return 0;

    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (penaltySettings.penaltyType) {
      case 'per_day':
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
      case 'per_week':
        const weeksOverdue = Math.ceil(daysOverdue / 7);
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * weeksOverdue);
      case 'fixed_total':
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100));
      default:
        return Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
    }
  };

  const suggestedPenalty = calculatePenalty();

  // useEffect(() => {
  //   if (suggestedPenalty > 0) {
  //     setFormData(prev => ({ ...prev, penalty: suggestedPenalty }));
  //   }
  // }, [suggestedPenalty]);


  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<RepaymentFormValues>({
    defaultValues: {
      amount: repayment.balance || repayment.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      penalty: suggestedPenalty,
      remarks: '',
      receiptNumber: '',
      bankDetails: '',
      chequeNumber: '',
      chequeDate: '',
      sendSMS: true,
    }
  });

  const paymentMode = watch('paymentMode');
  const amount = watch('amount');
  const penalty = watch('penalty');

  const onSubmit = (data: RepaymentFormValues) => {
    onSave({
      ...data,
      processedBy: user?.name,
      processedAt: new Date().toISOString()
    });
  };

  // const [errors, setErrors] = useState<Record<string, string>>({});

  // Get penalty settings from localStorage
  const getPenaltySettings = () => {
    try {
      const advancedSettings = localStorage.getItem('lms_advanced_settings');
      if (advancedSettings) {
        const settings = JSON.parse(advancedSettings);
        return settings.penaltySettings || { penaltyRate: 2.0, penaltyType: 'per_day' };
      }
    } catch (error) {
      console.error('Error loading penalty settings:', error);
    }
    return { penaltyRate: 2.0, penaltyType: 'per_day' };
  };

  const penaltySettings = getPenaltySettings();



  // const validateForm = () => {
  //   const newErrors: Record<string, string> = {};

  //   if (!formData.amount || formData.amount <= 0) {
  //     newErrors.amount = 'Payment amount is required and must be greater than 0';
  //   }

  //   if (formData.amount > (repayment.balance + suggestedPenalty)) {
  //     newErrors.amount = 'Payment amount cannot exceed the outstanding balance plus penalty';
  //   }

  //   if (!formData.paymentDate) {
  //     newErrors.paymentDate = 'Payment date is required';
  //   }

  //   if (formData.paymentMode === 'cheque') {
  //     if (!formData.chequeNumber) {
  //       newErrors.chequeNumber = 'Cheque number is required';
  //     }
  //     if (!formData.chequeDate) {
  //       newErrors.chequeDate = 'Cheque date is required';
  //     }
  //   }

  //   if (formData.paymentMode === 'online' && !formData.bankDetails) {
  //     newErrors.bankDetails = 'Bank transaction details are required';
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // if (!validateForm()) return;

  //   const paymentData = {
  //     ...formData,
  //     processedBy: user?.name,
  //     processedAt: new Date().toISOString()
  //   };

  //   onSave(paymentData);
  // };

  // const getPaymentModeIcon = (mode: string) => {
  //   switch (mode) {
  //     case 'cash': return <Banknote className="w-5 h-5" />;
  //     case 'online': return <Building className="w-5 h-5" />;
  //     case 'cheque': return <CreditCard className="w-5 h-5" />;
  //     default: return <DollarSign className="w-5 h-5" />;
  //   }
  // };

  const isOverdue = new Date(repayment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
          <p className="text-gray-600">Process repayment for EMI #{repayment.emiNo}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Repayment Summary */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Repayment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-600">Customer</p>
            <p className="font-medium text-blue-900">{customer?.name}</p>
            <p className="text-sm text-blue-700">{customer?.phone}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Loan Details</p>
            <p className="font-medium text-blue-900">ID: {repayment?.loanId?._id}</p>
            <p className="text-sm text-blue-700">EMI #{repayment.emiNo} of {loan?.period}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Due Information</p>
            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-blue-900'}`}>
              Due: {new Date(repayment.dueDate).toLocaleDateString()}
            </p>
            {isOverdue && (
              <p className="text-sm text-red-600">
                {Math.floor((new Date().getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (LKR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 1, message: 'Amount must be greater than 0' },
                    max: { value: repayment.balance + suggestedPenalty, message: 'Exceeds outstanding balance plus penalty' },
                  })}
                  className={`w-full border p-2 rounded ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Calculator className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount?.message}</p>}

              <div className="mt-2 text-sm space-y-1">
                <p className="text-gray-600">EMI Amount: LKR {repayment.amount.toLocaleString()}</p>
                <p className="text-gray-600">Outstanding: LKR {repayment.balance.toLocaleString()}</p>
                {suggestedPenalty > 0 && (
                  <p className="text-red-600">Suggested Penalty: LKR {suggestedPenalty.toLocaleString()}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              {/* <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                  }`}
              /> */}
              <input
                type="date"
                {...register('paymentDate', { required: 'Payment date is required' })}
                className={`w-full border p-2 rounded ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.paymentDate && <p className="text-red-500 text-sm mt-1">{errors.paymentDate?.message}</p>}
            </div>
          </div>

          {/* Penalty */}
          {suggestedPenalty > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-800">Overdue Penalty</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-1">
                    Penalty Amount (LKR)
                  </label>
                  {/* <input
                    type="number"
                    step="0.01"
                    value={formData.penalty}
                    onChange={(e) => setFormData({ ...formData, penalty: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder={`Suggested: ${suggestedPenalty}`}
                  /> */}
                  <input
                    type="number"
                    step="0.01"
                    {...register('penalty')}
                    placeholder={`Suggested: ${suggestedPenalty}`}
                    className="w-full border p-2 rounded border-yellow-300"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setValue('penalty', suggestedPenalty)}
                    // onClick={() => setFormData({ ...formData, penalty: suggestedPenalty })}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Apply Suggested
                  </button>
                </div>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                {penaltySettings.penaltyType === 'per_day' && (
                  <>Penalty is calculated at {penaltySettings.penaltyRate}% per day on the overdue amount.</>
                )}
                {penaltySettings.penaltyType === 'per_week' && (
                  <>Penalty is calculated at {penaltySettings.penaltyRate}% per week on the overdue amount.</>
                )}
                {penaltySettings.penaltyType === 'fixed_total' && (
                  <>Penalty is a fixed {penaltySettings.penaltyRate}% of the overdue amount.</>
                )}
              </p>
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Mode *
            </label>
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'cash', label: 'Cash Payment', icon: Banknote },
                { value: 'online', label: 'Online Transfer', icon: Building },
                { value: 'cheque', label: 'Cheque', icon: CreditCard }
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = field.value === mode.value;
                return (
                  <label
                    key={mode.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.paymentMode === mode.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode.value}
                      checked={formData.paymentMode === mode.value}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mr-3 ${formData.paymentMode === mode.value ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    <span className={`font-medium ${formData.paymentMode === mode.value ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                      {mode.label}
                    </span>
                  </label>
                );
              })}
            </div> */}
            <Controller
              name="paymentMode"
              control={control}
              defaultValue="cash"
              rules={{ required: 'Payment mode is required' }}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'cash', label: 'Cash Payment', icon: Banknote },
                    { value: 'online', label: 'Online Transfer', icon: Building },
                    { value: 'cheque', label: 'Cheque', icon: CreditCard }
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = field.value === mode.value;

                    return (
                      <label
                        key={mode.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          value={mode.value}
                          checked={isSelected}
                          onChange={() => field.onChange(mode.value)}
                          className="sr-only"
                        />
                        <Icon
                          className={`w-5 h-5 mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-400'
                            }`}
                        />
                        <span
                          className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'
                            }`}
                        >
                          {mode.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {/* Mode-specific fields */}
          {paymentMode === 'online' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Online Transfer Details</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference / Bank Details *
                </label>
                {/* <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.bankDetails ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Transaction ID, Bank name, Account details"
                /> */}
                <input
                  type="text"
                  {...register('bankDetails', { required: 'Bank details required for online payment' })}
                  className={`w-full border p-2 rounded ${errors.bankDetails ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Transaction ID, Bank name, Account details"
                />
                {errors.bankDetails && <p className="text-red-500 text-sm mt-1">{errors.bankDetails?.message}</p>}
              </div>
            </div>
          )}

          {paymentMode === 'cheque' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Cheque Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Number *
                  </label>
                  <input
                    type="text"
                    {...register('chequeNumber', { required: 'Cheque number required' })}
                    className={`w-full border p-2 rounded ${errors.chequeNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cheque number"

                  />
                  {/* <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.chequeNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Cheque number"
                  /> */}
                  {errors.chequeNumber && <p className="text-red-500 text-sm mt-1">{errors.chequeNumber?.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Date *
                  </label>
                  <input
                    type="date"
                    {...register('chequeDate', { required: 'Cheque date required' })}
                    className={`w-full border p-2 rounded ${errors.chequeDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {/* <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.chequeDate ? 'border-red-300' : 'border-gray-300'
                      }`}
                  /> */}
                  {errors.chequeDate && <p className="text-red-500 text-sm mt-1">{errors.chequeDate?.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Number
            </label>
            <input
              type="text"
              {...register('receiptNumber')}
              placeholder="Receipt number (auto-generated if empty)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {/* <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Receipt number (auto-generated if empty)"
            /> */}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              rows={3}
              {...register('remarks')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or comments..."
            />
            {/* <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or comments..."
            /> */}
          </div>

          {/* SMS Notification */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('sendSMS')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {/* <input
              type="checkbox"
              id="sendSMS"
              checked={formData.sendSMS}
              onChange={(e) => setFormData({ ...formData, sendSMS: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            /> */}
            <label htmlFor="sendSMS" className="ml-2 block text-sm text-gray-900">
              Send payment confirmation SMS to customer
            </label>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Payment Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Payment Amount:</span>
                <span className="ml-2 font-medium">LKR {amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-green-600">Penalty:</span>
                <span className="ml-2 font-medium">LKR {penalty.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-green-600">Total Collected:</span>
                <span className="ml-2 font-medium">LKR {(amount + penalty).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-green-600">Remaining Balance:</span>
                <span className="ml-2 font-medium">LKR {Math.max(0, repayment.balance - amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}