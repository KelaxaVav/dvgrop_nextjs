import { X, DollarSign, Calendar, Building, Banknote, CreditCard, User, FileText, Download, CheckCircle } from 'lucide-react';
import { Customer } from '../../types';
import { ILoan } from '../../types/loan';

interface DisbursementDetailsProps {
  loan: ILoan;
  customer?: Customer;
  onClose: () => void;
}

export default function DisbursementDetails({ loan, customer, onClose }: DisbursementDetailsProps) {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building className="w-5 h-5" />;
      case 'cash': return <Banknote className="w-5 h-5" />;
      case 'cheque': return <CreditCard className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-yellow-100 text-yellow-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isDisbursed = loan.status === 'disbursed' || loan.status === 'active';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Disbursement Details</h2>
          <p className="text-gray-600">Complete loan disbursement information</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg border-2 ${
        isDisbursed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {isDisbursed ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <Calendar className="w-6 h-6 text-yellow-600 mr-3" />
          )}
          <div>
            <h3 className={`font-semibold ${
              isDisbursed ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isDisbursed ? 'Funds Disbursed Successfully' : 'Ready for Disbursement'}
            </h3>
            <p className={`text-sm ${
              isDisbursed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isDisbursed 
                ? `Disbursed on ${loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'N/A'}`
                : 'Loan approved and ready for fund disbursement'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Information */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Loan Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Loan ID:</span>
                <span className="text-blue-900">{loan._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Type:</span>
                <span className="text-blue-900 capitalize">{loan.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Purpose:</span>
                <span className="text-blue-900">{loan.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Requested Amount:</span>
                <span className="text-blue-900">LKR {loan.requestedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Approved Amount:</span>
                <span className="text-blue-900 font-semibold">LKR {(loan.approvedAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Interest Rate:</span>
                <span className="text-blue-900">{loan.interestRate}% per month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Period:</span>
                <span className="text-blue-900">{loan.period} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">EMI:</span>
                <span className="text-blue-900">LKR {loan.emi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customer && (
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Name:</span>
                  <span className="text-green-900">{customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">NIC:</span>
                  <span className="text-green-900">{customer.nic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Phone:</span>
                  <span className="text-green-900">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Email:</span>
                  <span className="text-green-900">{customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Occupation:</span>
                  <span className="text-green-900">{customer.occupation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Monthly Income:</span>
                  <span className="text-green-900">LKR {customer.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Bank Account:</span>
                  <span className="text-green-900">{customer.bankAccount || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Approval Information */}
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Approval Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-600 font-medium">Approved By:</span>
                <span className="text-yellow-900">{loan?.approvedBy?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600 font-medium">Approval Date:</span>
                <span className="text-yellow-900">
                  {loan.approvedDate ? new Date(loan.approvedDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {loan.remarks && (
                <div>
                  <span className="text-yellow-600 font-medium">Remarks:</span>
                  <p className="text-yellow-900 mt-1">{loan.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disbursement Information */}
        <div className="space-y-6">
          {isDisbursed ? (
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Disbursement Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Disbursed Amount:</span>
                  <span className="text-purple-900 font-semibold text-lg">
                    LKR {(loan.disbursedAmount || loan.approvedAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Disbursement Date:</span>
                  <span className="text-purple-900">
                    {loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 font-medium">Method:</span>
                  <div className="flex items-center text-purple-900">
                    {loan.disbursementMethod && getMethodIcon(loan.disbursementMethod)}
                    <span className="ml-2 capitalize">
                      {loan.disbursementMethod?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Reference Number:</span>
                  <span className="text-purple-900 font-mono">{loan.disbursementReference || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600 font-medium">Disbursed By:</span>
                  <span className="text-purple-900">{loan?.disbursedBy?.name || 'N/A'}</span>
                </div>
                {loan.remarks && (
                  <div>
                    <span className="text-purple-600 font-medium">Disbursement Remarks:</span>
                    <p className="text-purple-900 mt-1">{loan.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Disbursement Status</h3>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Awaiting Disbursement</p>
                <p className="text-gray-500 text-sm mt-2">
                  This loan has been approved and is ready for fund disbursement
                </p>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal Amount:</span>
                <span className="text-gray-900">LKR {(loan.approvedAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="text-gray-900">{loan.interestRate}% per month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="text-gray-900">
                  LKR {((loan.approvedAmount || 0) * (loan.interestRate / 100) * loan.period).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Total Repayment:</span>
                <span className="text-gray-900 font-semibold">
                  LKR {(loan.emi * loan.period).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly EMI:</span>
                <span className="text-gray-900">LKR {loan.emi.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Period:</span>
                <span className="text-gray-900">{loan.period} months</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3>
            <div className="space-y-2">
              {loan.documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {loan.documents.length === 0 && (
                <p className="text-gray-500 text-center py-4">No documents available</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {isDisbursed && (
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}