import React, { useState } from 'react';
import { X, DollarSign, Calculator, CreditCard, Banknote, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface LoanPaymentFormProps {
  repayment: any;
  onSubmit: (paymentData: any) => void;
  onCancel: () => void;
}

export default function LoanPaymentForm({ repayment, onSubmit, onCancel }: LoanPaymentFormProps) {
  const { user } = useAuth();
  const { loans } = useData();
  
  const [formData, setFormData] = useState({
    amount: repayment.balance,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'cash' as 'cash' | 'online' | 'cheque',
    penalty: repayment.penalty || 0,
    discount: 0,
    remarks: '',
    receiptNumber: '',
    bankDetails: '',
    chequeNumber: '',
    chequeDate: '',
    customerPresent: true,
    idVerified: true,
    sendSMS: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Payment amount is required and must be greater than 0';
    }

    const maxAmount = repayment.balance + formData.penalty;
    if (formData.amount > maxAmount) {
      newErrors.amount = `Payment amount cannot exceed LKR ${maxAmount.toLocaleString()}`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (formData.paymentMode === 'cheque') {
      if (!formData.chequeNumber) {
        newErrors.chequeNumber = 'Cheque number is required';
      }
      if (!formData.chequeDate) {
        newErrors.chequeDate = 'Cheque date is required';
      }
    }

    if (formData.paymentMode === 'online' && !formData.bankDetails) {
      newErrors.bankDetails = 'Bank transaction details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const paymentData = {
      ...formData,
      processedBy: user?.name,
      processedAt: new Date().toISOString(),
      receiptNumber: formData.receiptNumber || `RCP-${Date.now()}`
    };

    onSubmit(paymentData);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash': return <Banknote className="w-5 h-5" />;
      case 'online': return <Building className="w-5 h-5" />;
      case 'cheque': return <CreditCard className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const calculateTotalPayment = () => {
    return formData.amount + formData.penalty - formData.discount;
  };

  const calculateNewBalance = () => {
    return Math.max(0, repayment.balance - formData.amount);
  };

  const isFullPayment = () => {
    return formData.amount >= repayment.balance;
  };

  const getPaymentStatus = () => {
    if (isFullPayment()) return 'Full Payment';
    return 'Partial Payment';
  };

  // Calculate penalty based on settings
  const calculatePenalty = () => {
    if (!repayment.isOverdue) return 0;
    
    const daysOverdue = repayment.daysOverdue || 0;
    const penaltyRate = penaltySettings.penaltyRate;
    
    switch (penaltySettings.penaltyType) {
      case 'per_day':
        return Math.round(repayment.amount * (penaltyRate / 100) * daysOverdue);
      case 'per_week':
        const weeksOverdue = Math.ceil(daysOverdue / 7);
        return Math.round(repayment.amount * (penaltyRate / 100) * weeksOverdue);
      case 'fixed_total':
        return Math.round(repayment.amount * (penaltyRate / 100));
      default:
        return Math.round(repayment.amount * (penaltyRate / 100) * daysOverdue);
    }
  };

  // Update penalty when component mounts
  React.useEffect(() => {
    if (repayment.isOverdue) {
      const calculatedPenalty = calculatePenalty();
      setFormData(prev => ({ ...prev, penalty: calculatedPenalty }));
    }
  }, [repayment.isOverdue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Process Loan Payment</h2>
          <p className="text-gray-600">EMI #{repayment.emiNo} for {repayment.customer?.name}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Payment Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-600">Customer</p>
            <p className="font-medium text-blue-900">{repayment.customer?.name}</p>
            <p className="text-sm text-blue-700">{repayment.customer?.phone}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Loan Details</p>
            <p className="font-medium text-blue-900">ID: {repayment.loanId}</p>
            <p className="text-sm text-blue-700">EMI #{repayment.emiNo}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Due Information</p>
            <p className={`font-medium ${repayment.isOverdue ? 'text-red-600' : 'text-blue-900'}`}>
              Due: {new Date(repayment.dueDate).toLocaleDateString()}
            </p>
            {repayment.isOverdue && (
              <p className="text-sm text-red-600">{repayment.daysOverdue} days overdue</p>
            )}
          </div>
          <div>
            <p className="text-sm text-blue-600">Outstanding Balance</p>
            <p className="text-xl font-bold text-blue-900">LKR {repayment.balance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Calculator className="w-4 h-4" />
                </button>
              </div>
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Balance:</span>
                  <span className="font-medium">LKR {repayment.balance.toLocaleString()}</span>
                </div>
                {repayment.penalty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Penalty:</span>
                    <span className="font-medium text-red-600">LKR {repayment.penalty.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium ${isFullPayment() ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getPaymentStatus()}
                  </span>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: repayment.balance })}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Full EMI
                </button>
                {repayment.penalty > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: repayment.balance + repayment.penalty })}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    With Penalty
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: Math.round(repayment.balance / 2) })}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Half Payment
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.paymentDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.paymentDate && <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>}
            </div>
          </div>

          {/* Penalty and Discount */}
          {(repayment.penalty > 0 || repayment.isOverdue) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty Amount (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.penalty}
                  onChange={(e) => setFormData({ ...formData, penalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suggested: LKR {calculatePenalty().toLocaleString()} ({repayment.daysOverdue} days × {penaltySettings.penaltyRate}% {penaltySettings.penaltyType === 'per_day' ? 'per day' : penaltySettings.penaltyType === 'per_week' ? 'per week' : 'fixed'})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional discount for early payment or goodwill
                </p>
              </div>
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Mode *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'cash', label: 'Cash Payment', icon: Banknote, description: 'Physical cash payment' },
                { value: 'online', label: 'Online Transfer', icon: Building, description: 'Bank transfer or digital payment' },
                { value: 'cheque', label: 'Cheque', icon: CreditCard, description: 'Bank cheque payment' }
              ].map((mode) => {
                const Icon = mode.icon;
                return (
                  <label
                    key={mode.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.paymentMode === mode.value
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
                    <Icon className={`w-5 h-5 mr-3 mt-1 ${
                      formData.paymentMode === mode.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <span className={`font-medium block ${
                        formData.paymentMode === mode.value ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {mode.label}
                      </span>
                      <span className="text-sm text-gray-500">{mode.description}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mode-specific fields */}
          {formData.paymentMode === 'online' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Online Transfer Details</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference / Bank Details *
                </label>
                <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bankDetails ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Transaction ID, Bank name, Account details"
                />
                {errors.bankDetails && <p className="text-red-500 text-sm mt-1">{errors.bankDetails}</p>}
              </div>
            </div>
          )}

          {formData.paymentMode === 'cheque' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Cheque Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Number *
                  </label>
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.chequeNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Cheque number"
                  />
                  {errors.chequeNumber && <p className="text-red-500 text-sm mt-1">{errors.chequeNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cheque Date *
                  </label>
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.chequeDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.chequeDate && <p className="text-red-500 text-sm mt-1">{errors.chequeDate}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Verification Checkboxes */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-3">Verification</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.customerPresent}
                  onChange={(e) => setFormData({ ...formData, customerPresent: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-yellow-800">Customer is present</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.idVerified}
                  onChange={(e) => setFormData({ ...formData, idVerified: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-yellow-800">Customer ID verified</span>
              </label>
            </div>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Number
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated if empty"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes or comments..."
            />
          </div>

          {/* SMS Notification */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendSMS"
              checked={formData.sendSMS}
              onChange={(e) => setFormData({ ...formData, sendSMS: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendSMS" className="ml-2 block text-sm text-gray-900">
              Send payment confirmation SMS to customer
            </label>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-3">Final Payment Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-green-600">Payment Amount:</span>
                <p className="font-medium text-green-900">LKR {formData.amount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Penalty:</span>
                <p className="font-medium text-green-900">LKR {formData.penalty.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Discount:</span>
                <p className="font-medium text-green-900">LKR {formData.discount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-green-600">Total Collected:</span>
                <p className="font-bold text-green-900 text-lg">LKR {calculateTotalPayment().toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-green-600">Remaining Balance:</span>
                <p className="font-medium text-green-900">LKR {calculateNewBalance().toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-green-600">Payment Status:</span>
                <p className={`font-medium ${isFullPayment() ? 'text-green-900' : 'text-yellow-700'}`}>
                  {getPaymentStatus()}
                </p>
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
              <CheckCircle className="w-4 h-4 mr-2" />
              Process Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}