import { X, DollarSign, Calendar, User, FileText, CreditCard, AlertTriangle, CheckCircle, Download, Phone, Mail } from 'lucide-react';

interface PaymentDetailsProps {
  payment: any;
  onClose: () => void;
  onMakePayment: () => void;
}

export default function PaymentDetails({ payment, onClose, onMakePayment }: PaymentDetailsProps) {
  const getStatusColor = () => {
    if (payment.status === 'paid') return 'bg-green-100 text-green-800 border-green-200';
    if (payment.status === 'partial') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (payment.isOverdue) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusIcon = () => {
    if (payment.status === 'paid') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (payment.isOverdue) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <Calendar className="w-5 h-5 text-blue-600" />;
  };

  const calculateProgress = () => {
    if (!payment.loan) return 0;
    return Math.round((payment?.emiNo / payment?.loan?.period) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
          <p className="text-gray-600">EMI #{payment?.emiNo} for Loan {payment?.loanId?._id}</p>
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
                {payment?.isOverdue && payment?.status === 'pending' ? 'Overdue Payment' : payment.status}
              </h3>
              <p className="text-sm">
                {payment.status === 'paid' && payment.paymentDate && `Paid on ${new Date(payment.paymentDate).toLocaleDateString()}`}
                {payment.isOverdue && `${payment.daysOverdue} days overdue`}
                {payment.status === 'pending' && !payment.isOverdue && `Due on ${new Date(payment.dueDate).toLocaleDateString()}`}
                {payment.status === 'partial' && `Partial payment of LKR ${payment.paidAmount?.toLocaleString()}`}
              </p>
            </div>
          </div>
          {payment.status !== 'paid' && (
            <button
              onClick={onMakePayment}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Make Payment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-medium">{payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">EMI Number</p>
                  <p className="font-medium">#{payment.emiNo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className={`font-medium ${payment.isOverdue ? 'text-red-600' : ''}`}>
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">EMI Amount</p>
                  <p className="font-medium">LKR {payment.amount.toLocaleString()}</p>
                </div>
              </div>

              {payment.paidAmount && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Paid Amount</p>
                    <p className="font-medium text-green-600">LKR {payment.paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className={`font-medium ${payment.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    LKR {payment.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                    payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    payment.isOverdue ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {payment.isOverdue && payment.status === 'pending' ? 'overdue' : payment.status}
                  </span>
                </div>
              </div>

              {payment.penalty > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Penalty Applied</p>
                      <p className="text-sm text-red-600">
                        LKR {payment.penalty.toLocaleString()} ({payment.daysOverdue} days × 2% daily rate)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Details */}
          {payment.paymentMode && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Payment Mode</p>
                  <p className="font-medium capitalize">{payment.paymentMode}</p>
                </div>
                {payment.remarks && (
                  <div>
                    <p className="text-sm text-gray-600">Remarks</p>
                    <p className="font-medium">{payment.remarks}</p>
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
            {payment.customer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-lg">{payment.customer.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">NIC</p>
                    <p className="font-medium">{payment.customer.nic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="font-medium">{payment.customer.phone}</p>
                    </div>
                  </div>
                </div>

                {payment.customer.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="font-medium">{payment.customer.email}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Occupation</p>
                    <p className="font-medium">{payment.customer.occupation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Income</p>
                    <p className="font-medium">LKR {payment.customer.income.toLocaleString()}</p>
                  </div>
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
            {payment.loan ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan ID</p>
                    <p className="font-medium">{payment.loan.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loan Type</p>
                    <p className="font-medium capitalize">{payment.loan.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Principal Amount</p>
                    <p className="font-medium">LKR {(payment.loan.approvedAmount || payment.loan.requestedAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                    <p className="font-medium">{payment.loan.interestRate}% per month</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loan Period</p>
                    <p className="font-medium">{payment.loan.period} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly EMI</p>
                    <p className="font-medium">LKR {payment.loan.emi.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Loan Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    payment.loan.status === 'active' ? 'bg-green-100 text-green-800' :
                    payment.loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.loan.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loan information not available</p>
            )}
          </div>

          {/* Payment Progress */}
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">EMI Progress:</span>
                <span className="font-medium">{payment.emiNo} of {payment.loan?.period || 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Started</span>
                <span>{calculateProgress()}% Complete</span>
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
        {payment.status === 'paid' && (
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
        )}
        {payment.status !== 'paid' && (
          <button
            onClick={onMakePayment}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Make Payment
          </button>
        )}
      </div>
    </div>
  );
}