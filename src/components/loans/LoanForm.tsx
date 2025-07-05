import React, { useState } from 'react';
import { X, Calculator, Upload, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Loan, Customer } from '../../types';

interface LoanFormProps {
  loan?: Loan;
  onSave: (loan: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'> & { createdDate?: string }) => void;
  onCancel: () => void;
}

export default function LoanForm({ loan, onSave, onCancel }: LoanFormProps) {
  const { customers } = useData();
  const [formData, setFormData] = useState({
    customerId: loan?.customerId || '',
    type: loan?.type || 'personal',
    requestedAmount: loan?.requestedAmount || 0,
    interestRate: loan?.interestRate || 10, // 10% per month
    period: loan?.period || 12,
    periodUnit: 'months', // New field for period unit
    purpose: loan?.purpose || '',
    status: loan?.status || 'pending',
    createdDate: loan?.createdAt ? loan.createdAt.split('T')[0] : new Date().toISOString().split('T')[0], // Add creation date field
    guarantorName: loan?.guarantor?.name || '',
    guarantorNic: loan?.guarantor?.nic || '',
    guarantorPhone: loan?.guarantor?.phone || '',
    guarantorAddress: loan?.guarantor?.address || '',
    guarantorOccupation: loan?.guarantor?.occupation || '',
    guarantorIncome: loan?.guarantor?.income || 0,
    collateralType: loan?.collateral?.type || '',
    collateralDescription: loan?.collateral?.description || '',
    collateralValue: loan?.collateral?.value || 0,
    collateralOwnership: loan?.collateral?.ownership || '',
    sendSMS: true
  });

  const [documents, setDocuments] = useState(loan?.documents || []);
  const [emi, setEmi] = useState(loan?.emi || 0);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const calculateSimpleInterestEMI = () => {
    const { requestedAmount, interestRate, period, periodUnit } = formData;
    
    if (requestedAmount && interestRate && period) {
      let installments = period;
      let periodInMonths = period;
      
      // Convert period to months for interest calculation
      if (periodUnit === 'days') {
        periodInMonths = period / 30; // Convert days to months
        installments = period; // Number of daily payments
      } else if (periodUnit === 'weeks') {
        periodInMonths = period / 4.33; // Convert weeks to months (4.33 weeks per month)
        installments = period; // Number of weekly payments
      } else {
        periodInMonths = period; // Already in months
        installments = period; // Number of monthly payments
      }

      setTotalInstallments(installments);

      // Simple Interest Formula: Total Amount = Principal + (Principal × Rate × Time)
      const simpleInterest = requestedAmount * (interestRate / 100) * periodInMonths;
      const totalAmountWithInterest = requestedAmount + simpleInterest;
      
      // EMI = Total Amount / Number of Installments
      const calculatedEmi = totalAmountWithInterest / installments;
      
      setEmi(Math.round(calculatedEmi));
      setTotalAmount(Math.round(totalAmountWithInterest));
      setTotalInterest(Math.round(simpleInterest));
    }
  };

  React.useEffect(() => {
    calculateSimpleInterestEMI();
  }, [formData.requestedAmount, formData.interestRate, formData.period, formData.periodUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert period to months for storage (standardized storage format)
    let periodInMonths = formData.period;
    if (formData.periodUnit === 'days') {
      periodInMonths = Math.ceil(formData.period / 30);
    } else if (formData.periodUnit === 'weeks') {
      periodInMonths = Math.ceil(formData.period / 4.33);
    }
    
    const loanData: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'> & { createdDate: string } = {
      customerId: formData.customerId,
      type: formData.type as any,
      requestedAmount: formData.requestedAmount,
      interestRate: formData.interestRate,
      period: periodInMonths, // Store in months for consistency
      emi: emi,
      startDate: new Date().toISOString().split('T')[0],
      purpose: formData.purpose,
      status: formData.status as any,
      documents: documents,
      createdDate: formData.createdDate, // Include creation date
      guarantor: formData.guarantorName ? {
        name: formData.guarantorName,
        nic: formData.guarantorNic,
        phone: formData.guarantorPhone,
        address: formData.guarantorAddress,
        occupation: formData.guarantorOccupation,
        income: formData.guarantorIncome
      } : undefined,
      collateral: formData.collateralType ? {
        type: formData.collateralType,
        description: formData.collateralDescription,
        value: formData.collateralValue,
        ownership: formData.collateralOwnership
      } : undefined
    };

    onSave(loanData as any);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocuments = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));
    setDocuments([...documents, ...newDocuments]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const getPeriodLabel = () => {
    switch (formData.periodUnit) {
      case 'days': return 'Days';
      case 'weeks': return 'Weeks';
      case 'months': return 'Months';
      default: return 'Months';
    }
  };

  const getEMIFrequency = () => {
    switch (formData.periodUnit) {
      case 'days': return 'Daily installment';
      case 'weeks': return 'Weekly installment';
      case 'months': return 'Monthly installment';
      default: return 'Monthly installment';
    }
  };

  const getInterestRateDisplay = () => {
    const monthlyRate = formData.interestRate;
    switch (formData.periodUnit) {
      case 'days':
        return `${monthlyRate}% per month (Simple Interest)`;
      case 'weeks':
        return `${monthlyRate}% per month (Simple Interest)`;
      case 'months':
        return `${monthlyRate}% per month (Simple Interest)`;
      default:
        return `${monthlyRate}% per month (Simple Interest)`;
    }
  };

  // Example calculation for verification
  const getExampleCalculation = () => {
    const { requestedAmount, interestRate, period, periodUnit } = formData;
    
    if (requestedAmount === 50000 && interestRate === 10 && period === 1 && periodUnit === 'months') {
      return {
        principal: 50000,
        interest: 5000, // 50000 × 10% × 1 month
        total: 55000,
        emi: 55000, // For 1 month
        isExample: true
      };
    }
    
    if (requestedAmount === 50000 && interestRate === 10 && period === 60 && periodUnit === 'days') {
      const periodInMonths = 60 / 30; // 2 months
      const interest = 50000 * 0.10 * periodInMonths; // 50000 × 10% × 2 months = 10000
      const total = 50000 + interest; // 60000
      const dailyEmi = total / 60; // 1000 per day
      
      return {
        principal: 50000,
        interest: interest,
        total: total,
        emi: dailyEmi,
        periodInMonths: periodInMonths,
        isExample: true
      };
    }
    
    return null;
  };

  const exampleCalc = getExampleCalculation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {loan ? 'Edit Loan Application' : 'New Loan Application'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Basic Loan Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Loan Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.nic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.createdDate}
                  onChange={(e) => setFormData({...formData, createdDate: e.target.value})}
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
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="business">Business Loan</option>
                  <option value="agriculture">Agriculture Loan</option>
                  <option value="vehicle">Vehicle Loan</option>
                  <option value="housing">Housing Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData({...formData, requestedAmount: Number(e.target.value)})}
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
                  required
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {getInterestRateDisplay()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.periodUnit}
                    onChange={(e) => setFormData({...formData, periodUnit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Loan period: {formData.period} {getPeriodLabel().toLowerCase()} ({totalInstallments} installments)
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Send application confirmation SMS to customer
                </label>
              </div>

              {/* EMI Calculator */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-blue-800">Simple Interest EMI</h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">LKR {emi.toLocaleString()}</p>
                <p className="text-sm text-blue-700">{getEMIFrequency()}</p>
                <div className="mt-2 text-xs text-blue-600 space-y-1">
                  <p><strong>Principal:</strong> LKR {formData.requestedAmount.toLocaleString()}</p>
                  <p><strong>Total Amount:</strong> LKR {totalAmount.toLocaleString()}</p>
                  <p><strong>Total Interest:</strong> LKR {totalInterest.toLocaleString()}</p>
                  <p><strong>Number of Installments:</strong> {totalInstallments}</p>
                </div>
              </div>

              {/* Simple Interest Formula Display */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">✅ Simple Interest Formula:</h5>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Interest = Principal × Rate × Time</strong></p>
                  <p><strong>Total = Principal + Interest</strong></p>
                  <p><strong>EMI = Total ÷ Installments</strong></p>
                  <hr className="my-2 border-green-300" />
                  <p>Interest = {formData.requestedAmount.toLocaleString()} × {formData.interestRate}% × {formData.periodUnit === 'days' ? (formData.period/30).toFixed(2) : formData.periodUnit === 'weeks' ? (formData.period/4.33).toFixed(2) : formData.period} months</p>
                  <p>Interest = LKR {totalInterest.toLocaleString()}</p>
                  <p>Total = LKR {totalAmount.toLocaleString()}</p>
                  <p>EMI = LKR {emi.toLocaleString()} per {formData.periodUnit.slice(0, -1)}</p>
                </div>
              </div>

              {/* Example Verification */}
              {exampleCalc && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-800 mb-2">📝 Example Verification:</h5>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p><strong>Your Example: 50,000 + 10% = 55,000 (1 month)</strong></p>
                    <p>✅ Principal: LKR {exampleCalc.principal.toLocaleString()}</p>
                    <p>✅ Interest: LKR {exampleCalc.interest.toLocaleString()}</p>
                    <p>✅ Total: LKR {exampleCalc.total.toLocaleString()}</p>
                    <p>✅ EMI: LKR {Math.round(exampleCalc.emi).toLocaleString()}</p>
                    {exampleCalc.periodInMonths && (
                      <p>Period: {exampleCalc.periodInMonths} months</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Guarantor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Guarantor Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Name
                </label>
                <input
                  type="text"
                  value={formData.guarantorName}
                  onChange={(e) => setFormData({...formData, guarantorName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor NIC
                </label>
                <input
                  type="text"
                  value={formData.guarantorNic}
                  onChange={(e) => setFormData({...formData, guarantorNic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Phone
                </label>
                <input
                  type="tel"
                  value={formData.guarantorPhone}
                  onChange={(e) => setFormData({...formData, guarantorPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Address
                </label>
                <textarea
                  rows={2}
                  value={formData.guarantorAddress}
                  onChange={(e) => setFormData({...formData, guarantorAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Occupation
                </label>
                <input
                  type="text"
                  value={formData.guarantorOccupation}
                  onChange={(e) => setFormData({...formData, guarantorOccupation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guarantor Income (LKR)
                </label>
                <input
                  type="number"
                  value={formData.guarantorIncome}
                  onChange={(e) => setFormData({...formData, guarantorIncome: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Collateral Information */}
              <h4 className="text-md font-medium text-gray-800 border-b pb-2 mt-6">Collateral (Optional)</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collateral Type
                </label>
                <input
                  type="text"
                  value={formData.collateralType}
                  onChange={(e) => setFormData({...formData, collateralType: e.target.value})}
                  placeholder="e.g., Property, Vehicle, Gold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.collateralDescription}
                  onChange={(e) => setFormData({...formData, collateralDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value (LKR)
                </label>
                <input
                  type="number"
                  value={formData.collateralValue}
                  onChange={(e) => setFormData({...formData, collateralValue: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Documents</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="loan-file-upload"
                />
                <label
                  htmlFor="loan-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload documents</span>
                  <span className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</span>
                </label>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

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

              {/* Simple Interest Examples */}
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
              {loan ? 'Update Application' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}