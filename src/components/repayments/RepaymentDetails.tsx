import { X, DollarSign, Calendar, User, FileText, CreditCard, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { IPayment } from '../../types/payment';

interface RepaymentDetailsProps {
  repayment: IPayment;
  onClose: () => void;
}

export default function RepaymentDetails({ repayment, onClose }: RepaymentDetailsProps) {
  const { loans, customers } = useData();
  
  const loan = loans.find(l => l._id === repayment?.loanId?._id);
  const customer = customers.find(c => c._id === loan?.customerId);
  
  const isOverdue = repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
  const isPaid = repayment.status === 'paid';
  const isPartial = repayment.status === 'partial';

  const getStatusColor = () => {
    if (isPaid) return 'bg-green-100 text-green-800 border-green-200';
    if (isPartial) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusIcon = () => {
    if (isPaid) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isOverdue) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Calendar className="w-5 h-5 text-blue-600" />;
  };

  const calculateDaysOverdue = () => {
    if (!isOverdue) return 0;
    return Math.floor((new Date().getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const generateReceipt = () => {
    // Mock receipt generation
    const receiptData = {
      receiptNumber: `RCP-${repayment._id}`,
      date: repayment.paymentDate || new Date().toISOString(),
      customer: customer?.name,
      loanId: repayment.loanId,
      emiNo: repayment.emiNo,
      amount: repayment.paidAmount || repayment.amount,
      penalty: repayment.penalty || 0,
      paymentMode: repayment.paymentMode
    };

    console.log('Generating receipt:', receiptData);
    // In a real application, this would generate and download a PDF receipt
    alert('Receipt generation feature would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Repayment Details</h2>
          <p className="text-gray-600">EMI #{repayment.emiNo} for Loan {repayment?.loanId?._id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon()}
            <div className="ml-3">
              <h3 className="font-semibold capitalize">
                {isOverdue ? 'Overdue Payment' : repayment.status} 
              </h3>
              <p className="text-sm">
                {isPaid && repayment.paymentDate && `Paid on ${new Date(repayment.paymentDate).toLocaleDateString()}`}
                {isOverdue && `${calculateDaysOverdue()} days overdue`}
                {repayment.status === 'pending' && !isOverdue && `Due on ${new Date(repayment.dueDate).toLocaleDateString()}`}
                {isPartial && `Partial payment of LKR ${repayment.paidAmount?.toLocaleString()}`}
              </p>
            </div>
          </div>
          {isPaid && (
            <button
              onClick={generateReceipt}
              className="flex items-center px-3 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Receipt
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Repayment Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Repayment Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Repayment ID:</span>
                <span className="font-medium">{repayment._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI Number:</span>
                <span className="font-medium">#{repayment.emiNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {new Date(repayment.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI Amount:</span>
                <span className="font-medium">LKR {repayment.amount.toLocaleString()}</span>
              </div>
              {repayment.paidAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-medium text-green-600">LKR {repayment.paidAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className={`font-medium ${repayment.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  LKR {repayment.balance.toLocaleString()}
                </span>
              </div>
              {repayment.penalty && repayment.penalty > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Penalty:</span>
                  <span className="font-medium text-red-600">LKR {repayment.penalty.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isPaid ? 'bg-green-100 text-green-800' :
                  isPartial ? 'bg-yellow-100 text-yellow-800' :
                  isOverdue ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {isOverdue && repayment.status === 'pending' ? 'overdue' : repayment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {(repayment.paymentDate || repayment.paymentMode) && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-3 text-sm">
                {repayment.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium">{new Date(repayment.paymentDate).toLocaleDateString()}</span>
                  </div>
                )}
                {repayment.paymentMode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-medium capitalize">{repayment.paymentMode}</span>
                  </div>
                )}
                {repayment?.remarks && (
                  <div>
                    <span className="text-gray-600">Remarks:</span>
                    <p className="font-medium mt-1">{repayment.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customer & Loan Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            {customer ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">NIC:</span>
                  <span className="font-medium">{customer.nic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Income:</span>
                  <span className="font-medium">LKR {customer.income.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Customer information not available</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Loan Information
            </h3>
            {loan ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan ID:</span>
                  <span className="font-medium">{loan._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Type:</span>
                  <span className="font-medium capitalize">{loan.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal Amount:</span>
                  <span className="font-medium">LKR {(loan.approvedAmount || loan.requestedAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-medium">{loan.interestRate}% per month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Period:</span>
                  <span className="font-medium">{loan.period} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly EMI:</span>
                  <span className="font-medium">LKR {loan.emi.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    loan.status === 'active' ? 'bg-green-100 text-green-800' :
                    loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loan information not available</p>
            )}
          </div>

          {/* Payment History Summary */}
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">EMI Progress:</span>
                <span className="font-medium">{repayment.emiNo} of {loan?.period || 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loan ? (repayment.emiNo / loan.period) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Started</span>
                <span>{loan ? Math.round((repayment.emiNo / loan.period) * 100) : 0}% Complete</span>
                <span>Completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        {isPaid && (
          <button
            onClick={generateReceipt}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
        )}
      </div>
    </div>
  );
}