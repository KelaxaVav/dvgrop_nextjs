import { useEffect, useState } from 'react';
import { X, Calendar, DollarSign, CheckCircle, AlertTriangle, Clock, Download, Filter } from 'lucide-react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../types/redux_state';
import { fetchCustomers, fetchLoans, fetchPayments } from '../../services/fetch';

interface RepaymentScheduleProps {
  loanId: string;
  onClose: () => void;
}

export default function RepaymentSchedule({ loanId, onClose }: RepaymentScheduleProps) {
  const [statusFilter, setStatusFilter] = useState('all');
   const { payments } = useSelector((state: ReduxState) => state.payment);
  const { loans } = useSelector((state: ReduxState) => state.loan);
  const { customers } = useSelector((state: ReduxState) => state.customer);
  
  const loan = loans.find(l => l._id === loanId);
  const customer = customers.find(c => c._id === loan?.customerId);
  const loanRepayments = payments.filter(r => r.loanId?._id === loanId).sort((a, b) => a.emiNo - b.emiNo);

  const filteredRepayments = loanRepayments.filter(repayment => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') {
      return repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
    }
    return repayment.status === statusFilter;
  });

  

  const getScheduleStats = () => {
    const totalEMIs = loanRepayments.length;
    const paidEMIs = loanRepayments.filter(r => r.status === 'paid').length;
    const overdueEMIs = loanRepayments.filter(r => 
      r.status === 'pending' && new Date(r.dueDate) < new Date()
    ).length;
    const totalPaid = loanRepayments
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const totalOutstanding = loanRepayments
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.balance, 0);

    return { totalEMIs, paidEMIs, overdueEMIs, totalPaid, totalOutstanding };
  };

  const stats = getScheduleStats();

  const getStatusColor = (repayment: any) => {
    const isOverdue = repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
    
    if (repayment.status === 'paid') return 'bg-green-100 text-green-800';
    if (repayment.status === 'partial') return 'bg-yellow-100 text-yellow-800';
    if (isOverdue) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusIcon = (repayment: any) => {
    const isOverdue = repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
    
    if (repayment.status === 'paid') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (isOverdue) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-blue-600" />;
  };

  const exportSchedule = () => {
    const headers = ['EMI No', 'Due Date', 'Amount', 'Paid Amount', 'Balance', 'Status', 'Payment Date'];
    const csvData = filteredRepayments.map(repayment => [
      repayment.emiNo,
      repayment.dueDate,
      repayment.amount,
      repayment.paidAmount || 0,
      repayment.balance,
      repayment.status,
      repayment.paymentDate || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repayment-schedule-${loanId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!loan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Loan Not Found</h3>
        <p className="text-gray-500">The specified loan could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Repayment Schedule</h2>
          <p className="text-gray-600">Loan {loanId} - {customer?.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Loan Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-600">Loan Amount</p>
            <p className="text-xl font-bold text-blue-900">
              LKR {(loan.approvedAmount || loan.requestedAmount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Monthly EMI</p>
            <p className="text-xl font-bold text-blue-900">LKR {loan.emi.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Interest Rate</p>
            <p className="text-xl font-bold text-blue-900">{loan.interestRate}% per month</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Loan Period</p>
            <p className="text-xl font-bold text-blue-900">{loan.period} months</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600">Total EMIs</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalEMIs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600">Paid EMIs</p>
              <p className="text-lg font-bold text-gray-900">{stats.paidEMIs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600">Overdue</p>
              <p className="text-lg font-bold text-gray-900">{stats.overdueEMIs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600">Total Paid</p>
              <p className="text-lg font-bold text-gray-900">LKR {stats.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600">Outstanding</p>
              <p className="text-lg font-bold text-gray-900">LKR {stats.totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Repayment Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress:</span>
            <span className="font-medium">{stats.paidEMIs} of {stats.totalEMIs} EMIs paid</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.totalEMIs > 0 ? (stats.paidEMIs / stats.totalEMIs) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Started</span>
            <span>{stats.totalEMIs > 0 ? Math.round((stats.paidEMIs / stats.totalEMIs) * 100) : 0}% Complete</span>
            <span>Completion</span>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All EMIs</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <button
            onClick={exportSchedule}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMI No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMI Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepayments.map((repayment) => {
                const isOverdue = repayment.status === 'pending' && new Date(repayment.dueDate) < new Date();
                
                return (
                  <tr key={repayment?._id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(repayment)}
                        <span className="ml-2 text-sm font-medium text-gray-900">#{repayment.emiNo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(repayment.dueDate).toLocaleDateString()}</div>
                      {isOverdue && (
                        <div className="text-xs text-red-600">
                          {Math.floor((new Date().getTime() - new Date(repayment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        LKR {repayment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {repayment.paidAmount ? `LKR ${repayment.paidAmount.toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${repayment.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        LKR {repayment.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(repayment)}`}>
                        {isOverdue && repayment.status === 'pending' ? 'overdue' : repayment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {repayment.paymentDate ? new Date(repayment.paymentDate).toLocaleDateString() : '-'}
                      </div>
                      {repayment.paymentMode && (
                        <div className="text-xs text-gray-500 capitalize">{repayment.paymentMode}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRepayments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No repayments found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} repayments found for this loan`
                : 'No repayment schedule available for this loan'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}