import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Download, User, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Loan, Customer } from '../../types';

interface ApprovalDetailsProps {
  loan: Loan;
  customer?: Customer;
  onApprove: (loan: Loan, approvedAmount: number, remarks?: string) => void;
  onReject: (loan: Loan, remarks: string) => void;
  onClose: () => void;
  canApprove: boolean;
}

export default function ApprovalDetails({ 
  loan, 
  customer, 
  onApprove, 
  onReject, 
  onClose, 
  canApprove 
}: ApprovalDetailsProps) {
  const [approvedAmount, setApprovedAmount] = useState(loan.requestedAmount);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [sendSMS, setSendSMS] = useState(true);

  const calculateNewEMI = (amount: number) => {
    // Simple interest calculation
    const periodInMonths = loan.period;
    const simpleInterest = amount * (loan.interestRate / 100) * periodInMonths;
    const totalAmount = amount + simpleInterest;
    return Math.round(totalAmount / loan.period);
  };

  const getApprovalRecommendation = () => {
    if (!customer) return { recommendation: 'review', score: 0, reasons: ['Customer data not available'] };

    const reasons = [];
    let score = 50; // Base score

    // Income assessment
    const emiToIncomeRatio = (loan.emi / customer.income) * 100;
    if (emiToIncomeRatio <= 30) {
      score += 20;
      reasons.push('✅ Good EMI-to-income ratio');
    } else if (emiToIncomeRatio <= 50) {
      score += 10;
      reasons.push('⚠️ Moderate EMI-to-income ratio');
    } else {
      score -= 20;
      reasons.push('❌ High EMI-to-income ratio');
    }

    // Loan amount assessment
    const loanToAnnualIncome = (loan.requestedAmount / (customer.income * 12)) * 100;
    if (loanToAnnualIncome <= 200) {
      score += 15;
      reasons.push('✅ Reasonable loan amount');
    } else {
      score -= 15;
      reasons.push('❌ High loan amount relative to income');
    }

    // Documentation
    if (loan.documents.length >= 3) {
      score += 10;
      reasons.push('✅ Adequate documentation');
    } else {
      score -= 10;
      reasons.push('❌ Insufficient documentation');
    }

    // Guarantor
    if (loan.guarantor) {
      score += 15;
      reasons.push('✅ Guarantor provided');
    } else {
      score -= 5;
      reasons.push('⚠️ No guarantor');
    }

    // Collateral
    if (loan.collateral && loan.collateral.value > 0) {
      score += 10;
      reasons.push('✅ Collateral provided');
    }

    let recommendation = 'review';
    if (score >= 70) recommendation = 'approve';
    else if (score <= 40) recommendation = 'reject';

    return { recommendation, score, reasons };
  };

  const assessment = getApprovalRecommendation();

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(loan, approvedAmount, remarks);
    } else if (action === 'reject') {
      onReject(loan, remarks);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Loan Approval Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loan & Customer Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Loan Information */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Loan Application Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-blue-600 font-medium">Loan ID:</span> {loan.id}</div>
                  <div><span className="text-blue-600 font-medium">Type:</span> {loan.type}</div>
                  <div><span className="text-blue-600 font-medium">Requested Amount:</span> LKR {loan.requestedAmount.toLocaleString()}</div>
                  <div><span className="text-blue-600 font-medium">Interest Rate:</span> {loan.interestRate}% per month</div>
                  <div><span className="text-blue-600 font-medium">Period:</span> {loan.period} months</div>
                  <div><span className="text-blue-600 font-medium">Current EMI:</span> LKR {loan.emi.toLocaleString()}</div>
                  <div className="col-span-2"><span className="text-blue-600 font-medium">Purpose:</span> {loan.purpose}</div>
                </div>
              </div>

              {/* Customer Information */}
              {customer && (
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-green-600 font-medium">Name:</span> {customer.name}</div>
                    <div><span className="text-green-600 font-medium">NIC:</span> {customer.nic}</div>
                    <div><span className="text-green-600 font-medium">Phone:</span> {customer.phone}</div>
                    <div><span className="text-green-600 font-medium">Email:</span> {customer.email || 'N/A'}</div>
                    <div><span className="text-green-600 font-medium">Occupation:</span> {customer.occupation}</div>
                    <div><span className="text-green-600 font-medium">Monthly Income:</span> LKR {customer.income.toLocaleString()}</div>
                    <div><span className="text-green-600 font-medium">Marital Status:</span> {customer.maritalStatus}</div>
                    <div><span className="text-green-600 font-medium">Bank Account:</span> {customer.bankAccount || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Guarantor Information */}
              {loan.guarantor && (
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">Guarantor Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-yellow-600 font-medium">Name:</span> {loan.guarantor.name}</div>
                    <div><span className="text-yellow-600 font-medium">NIC:</span> {loan.guarantor.nic}</div>
                    <div><span className="text-yellow-600 font-medium">Phone:</span> {loan.guarantor.phone}</div>
                    <div><span className="text-yellow-600 font-medium">Occupation:</span> {loan.guarantor.occupation}</div>
                    <div><span className="text-yellow-600 font-medium">Income:</span> LKR {loan.guarantor.income.toLocaleString()}</div>
                    <div className="col-span-2"><span className="text-yellow-600 font-medium">Address:</span> {loan.guarantor.address}</div>
                  </div>
                </div>
              )}

              {/* Collateral Information */}
              {loan.collateral && (
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">Collateral Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-purple-600 font-medium">Type:</span> {loan.collateral.type}</div>
                    <div><span className="text-purple-600 font-medium">Value:</span> LKR {loan.collateral.value.toLocaleString()}</div>
                    <div className="col-span-2"><span className="text-purple-600 font-medium">Description:</span> {loan.collateral.description}</div>
                    <div className="col-span-2"><span className="text-purple-600 font-medium">Ownership:</span> {loan.collateral.ownership}</div>
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents ({loan.documents.length})</h3>
                <div className="space-y-2">
                  {loan.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">{doc.name}</p>
                          <p className="text-sm text-gray-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {loan.documents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assessment & Actions */}
            <div className="space-y-6">
              {/* AI Assessment */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Assessment Score
                </h3>
                
                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold mb-2 ${
                    assessment.score >= 70 ? 'text-green-600' : 
                    assessment.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {assessment.score}/100
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    assessment.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                    assessment.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assessment.recommendation.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-2">
                  {assessment.reasons.map((reason, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Analysis */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Analysis
                </h3>
                
                {customer && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">EMI to Income Ratio:</span>
                      <span className="font-medium">{Math.round((loan.emi / customer.income) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loan to Annual Income:</span>
                      <span className="font-medium">{Math.round((loan.requestedAmount / (customer.income * 12)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Disposable Income:</span>
                      <span className="font-medium">LKR {(customer.income - loan.emi).toLocaleString()}</span>
                    </div>
                    {loan.collateral && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan to Collateral Ratio:</span>
                        <span className="font-medium">{Math.round((loan.requestedAmount / loan.collateral.value) * 100)}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Approval Actions */}
              {canApprove && loan.status === 'pending' && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval Decision</h3>
                  
                  {!action && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setAction('approve')}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Loan
                      </button>
                      <button
                        onClick={() => setAction('reject')}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject Loan
                      </button>
                    </div>
                  )}

                  {action === 'approve' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approved Amount (LKR)
                        </label>
                        <input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {approvedAmount !== loan.requestedAmount && (
                          <p className="text-sm text-gray-600 mt-1">
                            New EMI: LKR {calculateNewEMI(approvedAmount).toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approval Remarks
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Add any remarks or conditions..."
                        />
                      </div>

                      {/* SMS Notification */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sendSMS"
                          checked={sendSMS}
                          onChange={(e) => setSendSMS(e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sendSMS" className="ml-2 block text-sm text-gray-900">
                          Send approval SMS to customer
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmit}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Confirm Approval
                        </button>
                        <button
                          onClick={() => setAction(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {action === 'reject' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rejection Reason *
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          rows={4}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Please provide a detailed reason for rejection..."
                        />
                      </div>

                      {/* SMS Notification */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sendRejectionSMS"
                          checked={sendSMS}
                          onChange={(e) => setSendSMS(e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sendRejectionSMS" className="ml-2 block text-sm text-gray-900">
                          Send rejection SMS to customer
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmit}
                          disabled={!remarks.trim()}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setAction(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Display for Non-Pending Loans */}
              {loan.status !== 'pending' && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Approval Status</h3>
                  <div className={`p-4 rounded-lg ${
                    loan.status === 'approved' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      {loan.status === 'approved' ? 
                        <CheckCircle className="w-5 h-5 mr-2" /> : 
                        <XCircle className="w-5 h-5 mr-2" />
                      }
                      <span className="font-medium capitalize">{loan.status}</span>
                    </div>
                    {loan.approvedBy && (
                      <p className="text-sm">By: {loan.approvedBy}</p>
                    )}
                    {loan.approvedDate && (
                      <p className="text-sm">Date: {new Date(loan.approvedDate).toLocaleDateString()}</p>
                    )}
                    {loan.approvedAmount && loan.status === 'approved' && (
                      <p className="text-sm">Amount: LKR {loan.approvedAmount.toLocaleString()}</p>
                    )}
                    {loan.remarks && (
                      <p className="text-sm mt-2">Remarks: {loan.remarks}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}