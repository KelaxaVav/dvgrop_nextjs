import React, { useState } from 'react';
import { X, DollarSign, Building, Banknote, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { Customer } from '../../types';
import { ILoan } from '../../types/loan';

interface DisbursementFormProps {
  loan: ILoan;
  customer?: Customer;
  onDisburse: (loan: ILoan, disbursementData: any) => void;
  onCancel: () => void;
}

export default function DisbursementForm({ loan, customer, onDisburse, onCancel }: DisbursementFormProps) {
  const [formData, setFormData] = useState({
    amount: loan.approvedAmount || loan.requestedAmount,
    method: 'bank_transfer',
    disbursementDate: new Date().toISOString().split('T')[0],
    reference: '',
    bankName: '',
    accountNumber: customer?.bankAccount || '',
    accountName: customer?.name || '',
    chequeNumber: '',
    remarks: '',
    sendSMS: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount is required and must be greater than 0';
    }

    if (!formData.disbursementDate) {
      newErrors.disbursementDate = 'Disbursement date is required';
    }

    if (!formData.reference) {
      newErrors.reference = 'Reference number is required';
    }

    if (formData.method === 'bank_transfer') {
      if (!formData.bankName) newErrors.bankName = 'Bank name is required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
      if (!formData.accountName) newErrors.accountName = 'Account name is required';
    }

    if (formData.method === 'cheque' && !formData.chequeNumber) {
      newErrors.chequeNumber = 'Cheque number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Generate reference if not provided
      const reference = formData.reference || `${formData.method.toUpperCase()}-${Date.now()}`;
      
      const disbursementData = {
        ...formData,
        reference
      };

      onDisburse(loan, disbursementData);
    } catch (error) {
      console.error('Disbursement error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      case 'cash': return <Banknote className="w-5 h-5" />;
      case 'cheque': return <CreditCard className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const generateReference = () => {
    const prefix = formData.method.toUpperCase().replace('_', '');
    const timestamp = Date.now().toString().slice(-6);
    const reference = `${prefix}${timestamp}`;
    setFormData({ ...formData, reference });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Loan Disbursement</h2>
          <p className="text-gray-600">Process fund disbursement for approved loan</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Loan Summary */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Loan Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-600">Customer</p>
            <p className="font-medium text-blue-900">{customer?.name}</p>
            <p className="text-sm text-blue-700">{customer?.nic}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Loan Details</p>
            <p className="font-medium text-blue-900">ID: {loan?._id}</p>
            <p className="text-sm text-blue-700">{loan?.type} loan • {loan?.period} months</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Approved Amount</p>
            <p className="font-medium text-blue-900 text-xl">LKR {(loan?.approvedAmount || 0).toLocaleString()}</p>
            <p className="text-sm text-blue-700">EMI: LKR {loan?.emi.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Disbursement Form */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Disbursement Details</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disbursement Amount (LKR) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-300' : 'border-gray-300'
                }`}
                max={loan.approvedAmount}
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Maximum: LKR {(loan.approvedAmount || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disbursement Date *
              </label>
              <input
                type="date"
                value={formData.disbursementDate}
                onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.disbursementDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.disbursementDate && <p className="text-red-500 text-sm mt-1">{errors.disbursementDate}</p>}
            </div>
          </div>

          {/* Disbursement Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Disbursement Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
                { value: 'cash', label: 'Cash Payment', icon: Banknote },
                { value: 'cheque', label: 'Cheque', icon: CreditCard }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.method === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={method.value}
                      checked={formData.method === method.value}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mr-3 ${
                      formData.method === method.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.method === method.value ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {method.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Method-specific fields */}
          {formData.method === 'bank_transfer' && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-800">Bank Transfer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.bankName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Commercial Bank"
                  />
                  {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Account number"
                  />
                  {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.accountName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Account holder name"
                  />
                  {errors.accountName && <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>}
                </div>
              </div>
            </div>
          )}

          {formData.method === 'cheque' && (
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-800">Cheque Details</h4>
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
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Issuing bank"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.method === 'cash' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 font-medium">Cash Disbursement Notice</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Ensure proper documentation and receipt generation for cash disbursements. 
                Both parties should sign the disbursement receipt.
              </p>
            </div>
          )}

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Number *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reference ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter or generate reference number"
              />
              <button
                type="button"
                onClick={generateReference}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Generate
              </button>
            </div>
            {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference}</p>}
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
              Send disbursement confirmation SMS to customer
            </label>
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
              placeholder="Additional notes or instructions..."
            />
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Disburse Funds
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}